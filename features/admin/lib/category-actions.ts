"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";

export async function getCategories() {
  await requireAdmin();
  return db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  });
}

export async function getCategoryById(id: string) {
  await requireAdmin();
  return db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: { products: true },
  });
}

export async function getCategoryBySlug(slug: string) {
  await requireAdmin();
  return db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  await requireAdmin();
  const [category] = await db.insert(categories).values(data).returning();
  revalidatePath("/admin/categories");
  return category;
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    image?: string;
    active?: boolean;
    sortOrder?: number;
  }
) {
  await requireAdmin();
  const [category] = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  return category;
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  // Check if category has products
  const category = await getCategoryById(id);
  if (category?.products && category.products.length > 0) {
    throw new Error("No se puede eliminar una categoría con productos asociados");
  }
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
}
