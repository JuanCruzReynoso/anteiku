"use server";

import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";

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
  await requireAdmin();
  const updateData: { status: typeof status; notes?: string; updatedAt: Date } = {
    status,
    updatedAt: new Date(),
  };
  if (notes !== undefined) {
    updateData.notes = notes;
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
