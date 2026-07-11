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
  category?: string;
  limit?: number;
  offset?: number;
}

// ─── Queries ────────────────────────────────────────────

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductWithVariants[]> {
  const { category, limit = 50, offset = 0 } = filters;

  const rows = await db.query.products.findMany({
    where: category ? eq(products.category, category as any) : undefined,
    limit,
    offset,
    with: {
      variantsList: true,
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  return rows.map((row) => ({
    ...row,
    variants: row.variantsList,
  }));
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithVariants | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      variantsList: true,
    },
  });

  if (!row) return null;

  return {
    ...row,
    variants: row.variantsList,
  };
}

export async function getProductById(
  id: string
): Promise<ProductWithVariants | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variantsList: true,
    },
  });

  if (!row) return null;

  return {
    ...row,
    variants: row.variantsList,
  };
}

export async function getFeaturedProducts(
  limit = 4
): Promise<ProductWithVariants[]> {
  const rows = await db.query.products.findMany({
    limit,
    with: {
      variantsList: true,
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  return rows.map((row) => ({
    ...row,
    variants: row.variantsList,
  }));
}

export async function getProductsByCategory(
  category: string,
  limit = 50
): Promise<ProductWithVariants[]> {
  return getProducts({ category, limit });
}

export async function searchProducts(
  query: string
): Promise<ProductWithVariants[]> {
  const rows = await db.query.products.findMany({
    where: sql`${products.name} ILIKE ${`%${query}%`} OR ${products.description} ILIKE ${`%${query}%`}`,
    limit: 20,
    with: {
      variantsList: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    variants: row.variantsList,
  }));
}
