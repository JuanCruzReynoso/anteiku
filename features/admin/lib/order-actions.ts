"use server";

import { db } from "@/db";
import { orders, orderItems, users, orderStatusHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { orderStatusSchema } from "./schemas";
import { ORDER_STATUS_LABELS } from "@/lib/status-labels";
import { isValidTransition } from "./order-transitions";

export async function getOrders() {
  await requireAdmin();
  return db.query.orders.findMany({
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    with: { items: true },
  });
}

export async function getOrderById(id: string) {
  await requireAdmin();
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: {
        with: {
          variant: {
            with: { product: true },
          },
        },
      },
    },
  });
}

export async function updateOrderStatus(
  id: string,
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled",
  notes?: string
) {
  const validated = orderStatusSchema.safeParse({ status, notes });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  const session = await requireAdmin();
  const adminUserId = session.user.id;

  // Fetch current order status
  const currentOrder = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    columns: { status: true },
  });
  if (!currentOrder) {
    return { error: "Orden no encontrada" };
  }

  // Validate transition
  if (!isValidTransition(currentOrder.status, validated.data.status)) {
    return {
      error: `No se puede cambiar de ${ORDER_STATUS_LABELS[currentOrder.status] ?? currentOrder.status} a ${ORDER_STATUS_LABELS[validated.data.status] ?? validated.data.status}`,
    };
  }

  // Use transaction to update order and insert history
  await db.transaction(async (tx) => {
    // Update order
    const updateData: { status: typeof status; notes?: string; updatedAt: Date } = {
      status: validated.data.status,
      updatedAt: new Date(),
    };
    if (validated.data.notes !== undefined) {
      updateData.notes = validated.data.notes;
    }
    await tx.update(orders).set(updateData).where(eq(orders.id, id));

    // Insert status history
    await tx.insert(orderStatusHistory).values({
      orderId: id,
      fromStatus: currentOrder.status as "pending" | "paid" | "shipped" | "delivered" | "cancelled",
      toStatus: validated.data.status,
      note: validated.data.notes ?? null,
      changedBy: adminUserId,
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  // Return the updated order
  const updatedOrder = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  });
  return updatedOrder;
}
