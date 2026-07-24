"use server";

import { db } from "@/db";
import { orders, orderItems, payments, variants, inventoryMovements, coupons, shipmentMethods, discounts, products } from "@/db/schema";
import { eq, sql, and, count } from "drizzle-orm";
import { auth } from "@/auth";
import { orderSchema, type OrderInput } from "./schema";
import { sendOrderConfirmation } from "@/lib/email";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";

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

      // 5. Lock stock rows with SELECT FOR UPDATE + re-fetch current stock + get product info (name, categoryId)
      const variantIds = items.map((item) => item.variantId);
      const lockedResult = await tx.execute(sql`
        SELECT v.id, v.stock, v.price, p.name as product_name, p.category_id, p.id as product_id
        FROM ${variants} v
        JOIN products p ON v.product_id = p.id
        WHERE v.id = ANY(${variantIds})
        FOR UPDATE
      `);

      // Parse rows into typed maps
      type LockedVariant = { id: string; stock: number; price: number; product_name: string; category_id: string | null; product_id: string };
      const rows = lockedResult as unknown as LockedVariant[];
      const variantMap = new Map<string, { stock: number; price: number; productName: string; categoryId: string | null; productId: string }>(
        rows.map((v) => [v.id, { stock: v.stock, price: v.price, productName: v.product_name, categoryId: v.category_id, productId: v.product_id }])
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

      // 7. Fetch product/category discounts for all items (active, within date range)
      const now = new Date();
      const productIds = [...new Set(rows.map((v) => v.product_id))];
      const categoryIds = [...new Set(rows.map((v) => v.category_id).filter(Boolean))] as string[];

      const itemDiscounts = await tx
        .select()
        .from(discounts)
        .where(
          and(
            eq(discounts.active, true),
            sql`(${discounts.startsAt} IS NULL OR ${discounts.startsAt} <= ${now})`,
            sql`(${discounts.endsAt} IS NULL OR ${discounts.endsAt} >= ${now})`,
            sql`(${discounts.productId} IN (${sql.join(productIds.map((id) => sql`${id}`), sql`, `)}) OR ${discounts.categoryId} IN (${sql.join(categoryIds.map((id) => sql`${id}`), sql`, `)}))`
          )
        );

      // Build discount lookup: productId → discount, categoryId → discount
      const productDiscountMap = new Map<string, typeof itemDiscounts[0]>();
      const categoryDiscountMap = new Map<string, typeof itemDiscounts[0]>();
      const appliedDiscountIds: string[] = [];
      for (const d of itemDiscounts) {
        if (d.productId && !productDiscountMap.has(d.productId)) {
          productDiscountMap.set(d.productId, d);
        }
        if (d.categoryId && !categoryDiscountMap.has(d.categoryId)) {
          categoryDiscountMap.set(d.categoryId, d);
        }
      }

      // 8. Calculate subtotal with product/category discounts applied per item
      let subtotal = 0;
      for (const item of items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          throw new Error(`Variante ${item.variantId} no encontrada.`);
        }
        let itemPrice = variant.price;

        // Apply product-specific discount first (keyed by product ID)
        const prodDiscount = productDiscountMap.get(variant.productId);
        if (prodDiscount) {
          if (prodDiscount.type === "percentage") {
            itemPrice = Math.round(itemPrice * (1 - prodDiscount.value / 100));
          } else {
            itemPrice = Math.max(0, itemPrice - prodDiscount.value);
          }
        }

        // Apply category discount on top
        if (variant.categoryId) {
          const catDiscount = categoryDiscountMap.get(variant.categoryId);
          if (catDiscount) {
            if (catDiscount.type === "percentage") {
              itemPrice = Math.round(itemPrice * (1 - catDiscount.value / 100));
            } else {
              itemPrice = Math.max(0, itemPrice - catDiscount.value);
            }
          }
        }

        subtotal += itemPrice * item.quantity;
      }

      // 8b. Fetch and apply global discounts (no product/category — apply to entire subtotal)
      const globalDiscounts = await tx
        .select()
        .from(discounts)
        .where(
          and(
            eq(discounts.active, true),
            sql`${discounts.productId} IS NULL`,
            sql`${discounts.categoryId} IS NULL`,
            sql`(${discounts.startsAt} IS NULL OR ${discounts.startsAt} <= ${now})`,
            sql`(${discounts.endsAt} IS NULL OR ${discounts.endsAt} >= ${now})`
          )
        );

      if (globalDiscounts.length > 0) {
        // Pick the best global discount: highest percentage, or first fixed
        const pctDiscounts = globalDiscounts.filter((d) => d.type === "percentage");
        const bestGlobal = pctDiscounts.length > 0
          ? pctDiscounts.reduce((best, d) => (d.value > best.value ? d : best))
          : globalDiscounts.find((d) => d.type === "fixed") ?? globalDiscounts[0];

        // Respect minPurchase
        if (!bestGlobal.minPurchase || subtotal >= bestGlobal.minPurchase) {
          if (bestGlobal.type === "percentage") {
            subtotal = Math.round(subtotal * (1 - bestGlobal.value / 100));
          } else {
            subtotal = Math.max(0, subtotal - bestGlobal.value);
          }
          appliedDiscountIds.push(bestGlobal.id);
        }
      }

      // Track product/category discount IDs for usage counting
      for (const d of itemDiscounts) {
        if (!appliedDiscountIds.includes(d.id)) {
          appliedDiscountIds.push(d.id);
        }
      }

      // 9. Fetch coupon ONCE with SELECT FOR UPDATE (Task 2.2 + 2.3)
      let coupon: typeof coupons.$inferSelect | null = null;
      if (couponCode) {
        const lockedCouponResult = await tx.execute(sql`
          SELECT * FROM ${coupons}
          WHERE ${coupons.code} = ${couponCode.toUpperCase()}
          FOR UPDATE
        `);
        const couponRows = lockedCouponResult as unknown as typeof coupons.$inferSelect[];
        coupon = couponRows[0] ?? null;
      }

      // 10. Apply coupon discount and validate per-user usage (Task 2.1)
      let discountAmount = 0;
      if (coupon && coupon.active) {
        const isValid =
          (!coupon.startsAt || now >= coupon.startsAt) &&
          (!coupon.endsAt || now <= coupon.endsAt) &&
          (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
          (!coupon.minPurchase || subtotal >= coupon.minPurchase);

        if (!isValid) {
          throw new Error("El cupón no es válido para esta compra.");
        }

        // Per-user usage check (Task 2.1)
        if (coupon.maxUsesPerUser) {
          const userId = session.user?.id;
          if (!userId) {
            throw new Error("Usuario no autenticado.");
          }
          const [{ userUsageCount }] = await tx
            .select({ userUsageCount: count() })
            .from(orders)
            .where(
              and(
                eq(orders.userId, userId),
                eq(orders.couponCode, (couponCode ?? "").toUpperCase())
              )
            );

          if (userUsageCount >= coupon.maxUsesPerUser) {
            throw new Error("Ya usaste este cupón el máximo de veces permitido");
          }
        }

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

      const totalAfterDiscount = subtotal - discountAmount;

      // 11. Calculate shipping (free if coupon is free_shipping or total >= threshold)
      let shippingCost = shippingMethod.cost;
      if (coupon?.type === "free_shipping") {
        shippingCost = 0;
      }
      if (totalAfterDiscount >= FREE_SHIPPING_THRESHOLD) {
        shippingCost = 0;
      }

      const total = totalAfterDiscount + shippingCost;

      // 12. Insert order (status: pending) — includes shipmentMethodId and couponCode
      const orderUserId = session.user?.id;
      if (!orderUserId) {
        throw new Error("Usuario no autenticado.");
      }
      const [order] = await tx
        .insert(orders)
        .values({
          userId: orderUserId,
          customerEmail: email,
          status: "pending",
          total,
          shipmentMethodId: shippingMethod.id,
          couponCode: couponCode?.toUpperCase() ?? null,
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

      // 12b. Increment usedCount for all applied discounts (once per order, not per item)
      if (appliedDiscountIds.length > 0) {
        await tx
          .update(discounts)
          .set({ usedCount: sql`${discounts.usedCount} + 1` })
          .where(sql`${discounts.id} IN (${sql.join(appliedDiscountIds.map((id) => sql`${id}`), sql`, `)})`);
      }

      // 11. Insert order items + decrement stock + record inventory movement
      for (const item of items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          throw new Error(`Variante ${item.variantId} no encontrada.`);
        }

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
        const variant = result.variantMap.get(item.variantId);
        if (!variant) {
          throw new Error(`Variante ${item.variantId} no encontrada.`);
        }
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
