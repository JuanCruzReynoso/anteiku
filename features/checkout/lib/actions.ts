"use server";

import { db } from "@/db";
import { orders, orderItems, payments, variants, inventoryMovements, coupons, shipmentMethods } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { orderSchema, type OrderInput } from "./schema";
import { sendOrderConfirmation } from "@/lib/email";

// ─── Types ──────────────────────────────────────────────

export interface CreateOrderResult {
  orderId?: string;
  error?: string;
}

// ─── Server Action ──────────────────────────────────────

export async function createOrder(input: OrderInput): Promise<CreateOrderResult> {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado para hacer un pedido." };
  }

  // 2. Validate inputs
  const validated = orderSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { items, shippingAddress, email, couponCode, shippingMethodId } = validated.data;

  try {
    // 3. Single transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // 4. Fetch shipping method
      const [shippingMethod] = await tx
        .select()
        .from(shipmentMethods)
        .where(eq(shipmentMethods.id, shippingMethodId))
        .limit(1);

      if (!shippingMethod) {
        throw new Error("Método de envío no encontrado.");
      }

      // 5. Lock stock rows with SELECT FOR UPDATE + re-fetch current stock + get product names
      const variantIds = items.map((item) => item.variantId);
      const lockedResult = await tx.execute(sql`
        SELECT v.id, v.stock, v.price, p.name as product_name
        FROM ${variants} v
        JOIN products p ON v.product_id = p.id
        WHERE v.id = ANY(${variantIds})
        FOR UPDATE
      `);

      // Parse rows into a typed map
      type LockedVariant = { id: string; stock: number; price: number; product_name: string };
      const rows = lockedResult as unknown as LockedVariant[];
      const variantMap = new Map<string, { stock: number; price: number; productName: string }>(
        rows.map((v) => [v.id, { stock: v.stock, price: v.price, productName: v.product_name }])
      );

      // 6. Validate stock for each item
      for (const item of items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          throw new Error(`Variante ${item.variantId} no encontrada.`);
        }
        if (variant.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${item.variantId}": disponible ${variant.stock}, solicitado ${item.quantity}.`
          );
        }
      }

      // 7. Calculate subtotal
      const subtotal = items.reduce((sum, item) => {
        const variant = variantMap.get(item.variantId)!;
        return sum + variant.price * item.quantity;
      }, 0);

      // 8. Apply coupon discount if provided
      let discountAmount = 0;
      if (couponCode) {
        const [coupon] = await tx
          .select()
          .from(coupons)
          .where(eq(coupons.code, couponCode.toUpperCase()))
          .limit(1);

        if (coupon && coupon.active) {
          // Validate coupon (time, usage, min purchase)
          const now = new Date();
          const isValid =
            (!coupon.startsAt || now >= coupon.startsAt) &&
            (!coupon.endsAt || now <= coupon.endsAt) &&
            (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
            (!coupon.minPurchase || subtotal >= coupon.minPurchase);

          if (isValid) {
            if (coupon.type === "percentage") {
              discountAmount = Math.round(subtotal * (coupon.value / 100));
            } else if (coupon.type === "fixed") {
              discountAmount = Math.min(coupon.value, subtotal);
            }
            // free_shipping handled in shipping calculation below

            // Increment usage count
            await tx
              .update(coupons)
              .set({ usedCount: sql`${coupons.usedCount} + 1` })
              .where(eq(coupons.id, coupon.id));
          }
        }
      }

      const totalAfterDiscount = subtotal - discountAmount;

      // 9. Calculate shipping (free if coupon is free_shipping or total >= 50000)
      let shippingCost = shippingMethod.cost;
      if (couponCode) {
        const [coupon] = await tx
          .select()
          .from(coupons)
          .where(eq(coupons.code, couponCode.toUpperCase()))
          .limit(1);
        if (coupon?.type === "free_shipping") {
          shippingCost = 0;
        }
      }
      if (totalAfterDiscount >= 50000) {
        shippingCost = 0;
      }

      const total = totalAfterDiscount + shippingCost;

      // 10. Insert order (status: pending)
      const [order] = await tx
        .insert(orders)
        .values({
          userId: session.user!.id!,
          customerEmail: email,
          status: "pending",
          total,
          shippingAddress: {
            name: shippingAddress.name,
            line1: shippingAddress.line1,
            line2: shippingAddress.line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
        })
        .returning({ id: orders.id });

      // 11. Insert order items + decrement stock + record inventory movement
      for (const item of items) {
        const variant = variantMap.get(item.variantId)!;

        // Insert order item
        await tx.insert(orderItems).values({
          orderId: order.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: variant.price,
        });

        // Decrement stock
        await tx
          .update(variants)
          .set({ stock: sql`${variants.stock} - ${item.quantity}` })
          .where(eq(variants.id, item.variantId));

        // Record inventory movement
        await tx.insert(inventoryMovements).values({
          variantId: item.variantId,
          change: -item.quantity,
          reason: "purchase",
          notes: `Order ${order.id}`,
        });
      }

      // 12. Insert pending payment record
      await tx.insert(payments).values({
        orderId: order.id,
        method: "demo",
        amount: total,
        status: "pending",
      });

      return { orderId: order.id, items, total, variantMap };
    });

    // Fire email confirmation (non-blocking, try/catch)
    // Email failure never blocks order creation
    sendOrderConfirmation({
      orderId: result.orderId,
      email: validated.data.email,
      items: result.items.map((item) => {
        const variant = result.variantMap.get(item.variantId)!;
        return {
          name: variant.productName,
          quantity: item.quantity,
          unitPrice: variant.price,
        };
      }),
      total: result.total,
    }).catch(() => {
      // Email failure is logged inside sendOrderConfirmation — never propagates
    });

    return { orderId: result.orderId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear el pedido.";
    return { error: message };
  }
}
