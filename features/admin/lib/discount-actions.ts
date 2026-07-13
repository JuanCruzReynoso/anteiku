"use server";

import { db } from "@/db";
import { discounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { discountSchema } from "./schemas";

export async function getDiscounts() {
  await requireAdmin();
  return db.query.discounts.findMany({
    orderBy: (discounts, { desc }) => [desc(discounts.createdAt)],
    with: { product: true, category: true },
  });
}

export async function createDiscount(data: {
  name: string;
  type: string;
  value: number;
  productId?: string;
  categoryId?: string;
  minPurchase?: number;
  startsAt?: Date;
  endsAt?: Date;
}) {
  const validated = discountSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [discount] = await db.insert(discounts).values(validated.data).returning();
  revalidatePath("/admin/discounts");
  return discount;
}

export async function updateDiscount(
  id: string,
  data: {
    name?: string;
    type?: string;
    value?: number;
    productId?: string;
    categoryId?: string;
    minPurchase?: number;
    startsAt?: Date;
    endsAt?: Date;
    active?: boolean;
  }
) {
  const validated = discountSchema.partial().safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [discount] = await db
    .update(discounts)
    .set({ ...validated.data, updatedAt: new Date() })
    .where(eq(discounts.id, id))
    .returning();
  revalidatePath("/admin/discounts");
  return discount;
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  await db.delete(discounts).where(eq(discounts.id, id));
  revalidatePath("/admin/discounts");
}
