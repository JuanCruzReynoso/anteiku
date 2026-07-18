import { db } from "@/db";
import { products, categories, variants, discounts } from "@/db/schema";
import { eq, desc, and, gte, lte, or, isNull, sql } from "drizzle-orm";
import { FEATURED_LIMIT, SEARCH_RESULTS_LIMIT } from "@/lib/config";

export async function getAllProducts() {
  return db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    where: eq(products.status, "active"),
    with: { category: true, variants: true, discounts: true },
  });
}

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { category: true, variants: true, discounts: true },
  });
}

export async function getProductById(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: { category: true, variants: true, discounts: true },
  });
}

export async function getProductsByCategory(categorySlug: string) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  if (!category) return [];
  return db.query.products.findMany({
    where: and(eq(products.categoryId, category.id), eq(products.status, "active")),
    with: { category: true, variants: true, discounts: true },
  });
}

export async function getFeaturedProducts(limit = FEATURED_LIMIT) {
  return db.query.products.findMany({
    where: and(eq(products.featured, true), eq(products.status, "active")),
    with: { category: true, variants: true, discounts: true },
    limit,
  });
}

export async function getAllCategories() {
  return db.query.categories.findMany({
    orderBy: [categories.sortOrder],
  });
}

export async function searchProducts(query: string, limit = SEARCH_RESULTS_LIMIT) {
  // Sanitize wildcards to prevent ILIKE injection
  const sanitized = query.replace(/[%_]/g, "\\$&");

  return db.query.products.findMany({
    where: and(
      or(
        sql`${products.name} ILIKE ${`%${sanitized}%`}`,
        sql`${products.description} ILIKE ${`%${sanitized}%`}`
      ),
      eq(products.status, "active")
    ),
    with: { category: true, variants: true, discounts: true },
    limit,
  });
}
