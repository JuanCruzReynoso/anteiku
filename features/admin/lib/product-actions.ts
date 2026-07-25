"use server";

import { db } from "@/db";
import { products, variants, orderItems } from "@/db/schema";
import { eq, ilike, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { productSchema, variantSchema } from "./schemas";

export async function getProducts() {
  await requireAdmin();
  return db.query.products.findMany({
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
}

/**
 * Fetches products with search, status filter, and offset-based pagination.
 */
export async function getProductsPaginated(params: {
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
    conditions.push(
      ilike(products.name, `%${search}%`)
    );
  }
  if (status) {
    conditions.push(eq(products.status, status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db.query.products.findMany({
      where,
      orderBy: [desc(products.createdAt)],
      limit: pageSize,
      offset,
      with: { category: true },
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    data: data.map((p) => ({
      id: p.id,
      name: p.name,
      categoryName: p.category?.name ?? "Sin categoría",
      basePrice: p.basePrice,
      status: p.status,
      imageUrl: p.images?.[0] ?? null,
    })),
    total,
    page,
    pageSize,
  };
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
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return product;
}

export async function toggleProductVisibility(id: string) {
  await requireAdmin();
  const [product] = await db
    .select({ status: products.status })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) return { error: "Producto no encontrado" };

  if (product.status === "draft") {
    return {
      error:
        "El producto está en borrador. Edita el producto para publicarlo.",
    };
  }

  const newStatus = product.status === "active" ? "inactive" : "active";
  await db
    .update(products)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(products.id, id));

  revalidatePath("/admin/products");
  return { status: newStatus };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
}

/**
 * Deletes a product only if none of its variants appear in order_items.
 * Returns an error with the order count if orders exist.
 */
export async function deleteProductWithCheck(
  id: string
): Promise<{ error: string; orderCount: number } | { success: true }> {
  await requireAdmin();

  // Find variant IDs belonging to this product
  const productVariants = await db
    .select({ id: variants.id })
    .from(variants)
    .where(eq(variants.productId, id));

  if (productVariants.length === 0) {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/admin/products");
    return { success: true };
  }

  const variantIds = productVariants.map((v) => v.id);

  // Check if any order items reference these variants
  const [orderCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orderItems)
    .where(sql`${orderItems.variantId} IN ${variantIds}`);

  const orderCount = orderCountResult?.count ?? 0;

  if (orderCount > 0) {
    return {
      error: `Este producto tiene ${orderCount} pedido(s) asociado(s). No se puede eliminar.`,
      orderCount,
    };
  }

  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  return { success: true };
}

/**
 * Clones a product and all its variants with "(copy)" suffix.
 * Returns the new product ID on success.
 */
export async function cloneProduct(
  id: string
): Promise<{ error: string } | { id: string }> {
  await requireAdmin();

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { variants: true },
  });

  if (!product) {
    return { error: "Producto no encontrado" };
  }

  // Build new slug with collision handling
  let newSlug = `${product.slug}-copia`;
  let counter = 1;
  while (true) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, newSlug),
    });
    if (!existing) break;
    newSlug = `${product.slug}-copia-${counter}`;
    counter++;
  }

  const newName = `${product.name} - copia`;

  // Insert cloned product
  const [clonedProduct] = await db
    .insert(products)
    .values({
      name: newName,
      slug: newSlug,
      description: product.description,
      basePrice: product.basePrice,
      categoryId: product.categoryId,
      images: product.images,
      status: "draft",
      featured: product.featured,
    })
    .returning();

  // Clone variants
  if (product.variants.length > 0) {
    await db.insert(variants).values(
      product.variants.map((v) => ({
        productId: clonedProduct.id,
        name: v.name,
        sku: `${v.sku}-copy`,
        price: v.price,
        stock: v.stock,
        options: v.options,
      }))
    );
  }

  revalidatePath("/admin/products");
  return { id: clonedProduct.id };
}

/**
 * Checks if a slug is unique, optionally excluding a product ID.
 */
export async function checkSlugUnique(
  slug: string,
  excludeId?: string
): Promise<{ unique: boolean }> {
  await requireAdmin();

  const conditions = [eq(products.slug, slug)];
  if (excludeId) {
    conditions.push(sql`${products.id} != ${excludeId}`);
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(and(...conditions));

  return { unique: (result?.count ?? 0) === 0 };
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
