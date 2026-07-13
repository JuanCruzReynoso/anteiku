"use server";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";

export async function getPayments() {
  await requireAdmin();
  return db.query.payments.findMany({
    orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    with: { order: true },
  });
}

export async function getPaymentsByOrderId(orderId: string) {
  await requireAdmin();
  return db.query.payments.findMany({
    where: eq(payments.orderId, orderId),
    orderBy: (payments, { desc }) => [desc(payments.createdAt)],
  });
}

export async function createPayment(data: {
  orderId: string;
  method: string;
  amount: number;
  transactionId?: string;
  status?: string;
}) {
  await requireAdmin();
  const [payment] = await db.insert(payments).values(data).returning();
  revalidatePath("/admin/orders");
  return payment;
}

export async function updatePaymentStatus(id: string, status: string) {
  await requireAdmin();
  const [payment] = await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.id, id))
    .returning();
  revalidatePath("/admin/orders");
  return payment;
}
