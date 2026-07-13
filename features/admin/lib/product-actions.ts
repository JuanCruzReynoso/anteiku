"use server";

import { db } from "@/db";
import { products, variants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";

export async function getProducts() {
  await requireAdmin();
  return db.query.products.findMany({
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
}

export async function getProductById(id: string) {
  await requireAdmin();
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: { variants: true },
  });
}

export async function createProduct(data: {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  status: "active" | "inactive" | "draft";
  featured: boolean;
  images: string[];
}) {
  await requireAdmin();
  const [product] = await db
    .insert(products)
    .values({
      ...data,
      featured: data.featured ? "true" : "false",
    })
    .returning();
  revalidatePath("/admin/products");
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    basePrice?: number;
    categoryId?: string;
    status?: "active" | "inactive" | "draft";
    featured?: boolean;
    images?: string[];
  }
) {
  await requireAdmin();
  const [product] = await db
    .update(products)
    .set({
      ...data,
      featured: data.featured !== undefined ? (data.featured ? "true" : "false") : undefined,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return product;
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
}

export async function getVariants(productId: string) {
  await requireAdmin();
  return db.query.variants.findMany({
    where: eq(variants.productId, productId),
  });
}

export async function createVariant(data: {
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options?: Record<string, string>;
}) {
  await requireAdmin();
  const [variant] = await db.insert(variants).values(data).returning();
  revalidatePath("/admin/products");
  return variant;
}

export async function updateVariant(
  id: string,
  data: {
    name?: string;
    sku?: string;
    price?: number;
    stock?: number;
    options?: Record<string, string>;
  }
) {
  await requireAdmin();
  const [variant] = await db
    .update(variants)
    .set(data)
    .where(eq(variants.id, id))
    .returning();
  revalidatePath("/admin/products");
  return variant;
}

export async function deleteVariant(id: string) {
  await requireAdmin();
  await db.delete(variants).where(eq(variants.id, id));
  revalidatePath("/admin/products");
}
