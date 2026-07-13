"use server";

import { db } from "@/db";
import { products, variants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { productSchema, variantSchema } from "./schemas";

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
  const validated = productSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [product] = await db
    .insert(products)
    .values({
      ...validated.data,
      featured: validated.data.featured ? "true" : "false",
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
  const validated = productSchema.partial().safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [product] = await db
    .update(products)
    .set({
      ...validated.data,
      featured: validated.data.featured !== undefined ? (validated.data.featured ? "true" : "false") : undefined,
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
  const validated = variantSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [variant] = await db.insert(variants).values({ ...validated.data, productId: data.productId }).returning();
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
  const validated = variantSchema.partial().safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [variant] = await db
    .update(variants)
    .set(validated.data)
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
