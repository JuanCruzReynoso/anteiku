import { eq, sql, type InferSelectModel } from "drizzle-orm";
import { db } from "@/db";
import { products, variants } from "@/db/schema";

// ─── Inferred Types ─────────────────────────────────────

export type Product = InferSelectModel<typeof products>;
export type Variant = InferSelectModel<typeof variants>;

export interface ProductWithVariants extends Product {
  variants: Variant[];
}

export interface ProductFilters {
  categoryId?: string;
  limit?: number;
  offset?: number;
}

// ─── Queries ────────────────────────────────────────────

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductWithVariants[]> {
  const { categoryId, limit = 50, offset = 0 } = filters;

  const rows = await db.query.products.findMany({
    where: categoryId ? eq(products.categoryId, categoryId) : undefined,
    limit,
    offset,
    with: {
      variants: true,
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  return rows.map((row) => ({
    ...row,
    variants: row.variants,
  }));
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithVariants | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      variants: true,
    },
  });

  if (!row) return null;

  return {
    ...row,
    variants: row.variants,
  };
}

export async function getProductById(
  id: string
): Promise<ProductWithVariants | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variants: true,
    },
  });

  if (!row) return null;

  return {
    ...row,
    variants: row.variants,
  };
}

export async function getFeaturedProducts(
  limit = 4
): Promise<ProductWithVariants[]> {
  const rows = await db.query.products.findMany({
    limit,
    with: {
      variants: true,
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  return rows.map((row) => ({
    ...row,
    variants: row.variants,
  }));
}

export async function getProductsByCategoryId(
  categoryId: string,
  limit = 50
): Promise<ProductWithVariants[]> {
  return getProducts({ categoryId, limit });
}

export async function searchProducts(
  query: string
): Promise<ProductWithVariants[]> {
  const rows = await db.query.products.findMany({
    where: sql`${products.name} ILIKE ${`%${query}%`} OR ${products.description} ILIKE ${`%${query}%`}`,
    limit: 20,
    with: {
      variants: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    variants: row.variants,
  }));
}
