import { db } from "@/db";
import { products, categories, variants } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllProducts() {
  return db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { category: true, variants: true },
  });
}

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { category: true, variants: true },
  });
}

export async function getProductById(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: { category: true, variants: true },
  });
}

export async function getProductsByCategory(categorySlug: string) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  if (!category) return [];
  return db.query.products.findMany({
    where: eq(products.categoryId, category.id),
    with: { category: true, variants: true },
  });
}

export async function getFeaturedProducts() {
  return db.query.products.findMany({
    where: eq(products.featured, "true"),
    with: { category: true, variants: true },
    limit: 4,
  });
}

export async function getAllCategories() {
  return db.query.categories.findMany({
    orderBy: [categories.sortOrder],
  });
}
