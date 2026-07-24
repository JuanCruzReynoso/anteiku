"use server";

import { db } from "@/db";
import { discounts, products, categories } from "@/db/schema";
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

export async function toggleDiscountActive(
  id: string
): Promise<{ active: boolean } | { error: string }> {
  await requireAdmin();
  const [discount] = await db
    .select()
    .from(discounts)
    .where(eq(discounts.id, id))
    .limit(1);
  if (!discount) return { error: "Descuento no encontrado" };

  const [updated] = await db
    .update(discounts)
    .set({ active: !discount.active, updatedAt: new Date() })
    .where(eq(discounts.id, id))
    .returning({ active: discounts.active });
  revalidatePath("/admin/discounts");
  return { active: updated.active ?? true };
}

export async function getProductsForPicker(): Promise<
  { id: string; name: string }[]
> {
  await requireAdmin();
  const rows = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .orderBy(products.name);
  return rows.map((r) => ({ id: r.id as string, name: r.name }));
}

export async function getCategoriesForPicker(): Promise<
  { id: string; name: string }[]
> {
  await requireAdmin();
  const rows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(categories.name);
  return rows.map((r) => ({ id: r.id, name: r.name }));
}
