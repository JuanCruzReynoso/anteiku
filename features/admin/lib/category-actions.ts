"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, ilike, or, and, sql, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { categorySchema } from "./schemas";

export async function getCategories() {
  await requireAdmin();
  return db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  });
}

/**
 * Fetches categories with search, status filter, and offset-based pagination.
 */
export async function getCategoriesPaginated(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  const { search, status, page = 1, pageSize = 20 } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (search) {
    conditions.push(or(ilike(categories.name, `%${search}%`), ilike(categories.slug, `%${search}%`)));
  }
  if (status) {
    conditions.push(eq(categories.active, status === "active"));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db.query.categories.findMany({
      where,
      orderBy: [asc(categories.sortOrder)],
      limit: pageSize,
      offset,
      with: { products: true },
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(categories)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    data: data.map((cat) => ({
      id: cat.id,
      sortOrder: cat.sortOrder,
      name: cat.name,
      slug: cat.slug,
      productCount: cat.products.length,
      active: cat.active,
    })),
    total,
    page,
    pageSize,
  };
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
  const validated = categorySchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [category] = await db.insert(categories).values(validated.data).returning();
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
  const validated = categorySchema.partial().safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [category] = await db
    .update(categories)
    .set({ ...validated.data, updatedAt: new Date() })
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
