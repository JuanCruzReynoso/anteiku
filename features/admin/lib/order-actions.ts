"use server";

import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { orderStatusSchema } from "./schemas";

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
  await requireAdmin();
  const updateData: { status: typeof status; notes?: string; updatedAt: Date } = {
    status: validated.data.status,
    updatedAt: new Date(),
  };
  if (validated.data.notes !== undefined) {
    updateData.notes = validated.data.notes;
  }
  const [order] = await db
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, id))
    .returning();
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return order;
}
