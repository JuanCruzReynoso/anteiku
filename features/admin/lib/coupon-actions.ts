"use server";

import { db } from "@/db";
import { coupons, orders } from "@/db/schema";
import { eq, and, count, sql, ilike, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { couponSchema } from "./schemas";

export async function getCoupons() {
  await requireAdmin();
  return db.query.coupons.findMany({
    orderBy: (coupons, { desc }) => [desc(coupons.createdAt)],
  });
}

/**
 * Fetches coupons with search, status filter, and offset-based pagination.
 */
export async function getCouponsPaginated(params: {
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
    conditions.push(or(ilike(coupons.code, `%${search}%`), ilike(coupons.name, `%${search}%`)));
  }
  if (status) {
    conditions.push(eq(coupons.active, status === "active"));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db.query.coupons.findMany({
      where,
      orderBy: [desc(coupons.createdAt)],
      limit: pageSize,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(coupons)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    data: data.map((c) => {
      let dateRange = "Sin limite";
      if (c.startsAt && c.endsAt) {
        dateRange = `${c.startsAt.toLocaleDateString("es-AR")} - ${c.endsAt.toLocaleDateString("es-AR")}`;
      } else if (c.startsAt) {
        dateRange = `Desde ${c.startsAt.toLocaleDateString("es-AR")}`;
      }
      return { ...c, dateRange };
    }),
    total,
    page,
    pageSize,
  };
}

export async function validateCoupon(code: string, purchaseAmount: number, userId?: string) {
  const coupon = await db.query.coupons.findFirst({
    where: eq(coupons.code, code.toUpperCase()),
  });

  if (!coupon || !coupon.active) {
    return { valid: false, error: "Cupon no valido" };
  }

  if (coupon.startsAt && new Date() < coupon.startsAt) {
    return { valid: false, error: "El cupon aun no esta activo" };
  }

  if (coupon.endsAt && new Date() > coupon.endsAt) {
    return { valid: false, error: "El cupon expiro" };
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "El cupon alcanzo el maximo de usos" };
  }

  // Per-user usage check
  if (coupon.maxUsesPerUser && userId) {
    const [{ userUsageCount }] = await db
      .select({ userUsageCount: count() })
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.couponCode, code.toUpperCase())
        )
      );

    if (userUsageCount >= coupon.maxUsesPerUser) {
      return { valid: false, error: "Ya usaste este cupón el máximo de veces permitido" };
    }
  }

  if (coupon.minPurchase && purchaseAmount < coupon.minPurchase) {
    return { valid: false, error: `Compra minima: $${coupon.minPurchase}` };
  }

  return { valid: true, coupon };
}

export async function createCoupon(data: {
  code: string;
  name: string;
  type: string;
  value: number;
  minPurchase?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  startsAt?: Date;
  endsAt?: Date;
}) {
  const validated = couponSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  try {
    const [coupon] = await db
      .insert(coupons)
      .values({ ...validated.data, code: validated.data.code.toUpperCase() })
      .returning();
    revalidatePath("/admin/coupons");
    return coupon;
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes("unique") ||
      (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23505")
    ) {
      return { error: "Ya existe un cupón con ese código" };
    }
    throw err;
  }
}

export async function updateCoupon(
  id: string,
  data: {
    code?: string;
    name?: string;
    type?: string;
    value?: number;
    minPurchase?: number;
    maxUses?: number;
    startsAt?: Date;
    endsAt?: Date;
    active?: boolean;
  }
) {
  const validated = couponSchema.partial().safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const updateData = { ...validated.data, updatedAt: new Date() };
  if (validated.data.code) updateData.code = validated.data.code.toUpperCase();
  const [coupon] = await db
    .update(coupons)
    .set(updateData)
    .where(eq(coupons.id, id))
    .returning();
  revalidatePath("/admin/coupons");
  return coupon;
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function toggleCouponActive(
  id: string
): Promise<{ active: boolean } | { error: string }> {
  await requireAdmin();
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);
  if (!coupon) return { error: "Cupón no encontrado" };

  const [updated] = await db
    .update(coupons)
    .set({ active: !coupon.active, updatedAt: new Date() })
    .where(eq(coupons.id, id))
    .returning({ active: coupons.active });
  revalidatePath("/admin/coupons");
  return { active: updated.active ?? true };
}

function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generateCouponCode(): Promise<{ code: string }> {
  await requireAdmin();
  let code: string;
  let attempts = 0;
  do {
    code = generateRandomCode(8);
    const existing = await db.query.coupons.findFirst({
      where: eq(coupons.code, code),
    });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);
  return { code };
}

export async function bulkCreateCoupons(input: {
  prefix?: string;
  quantity: number;
  type: string;
  value: number;
  minPurchase?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  startsAt?: Date;
  endsAt?: Date;
}): Promise<{ coupons: typeof coupons.$inferSelect[] } | { error: string }> {
  if (input.quantity > 100) {
    return { error: "No se pueden generar más de 100 cupones a la vez" };
  }
  await requireAdmin();

  const generatedCodes = new Set<string>();
  const couponsToInsert: (typeof coupons.$inferInsert)[] = [];

  for (let i = 0; i < input.quantity; i++) {
    let code: string;
    let attempts = 0;
    do {
      const randomPart = generateRandomCode(8);
      code = input.prefix ? `${input.prefix}-${randomPart}` : randomPart;
      attempts++;
    } while (generatedCodes.has(code) && attempts < 10);
    generatedCodes.add(code);

    couponsToInsert.push({
      code,
      name: input.prefix ? `${input.prefix} #${i + 1}` : `Cupón #${i + 1}`,
      type: input.type,
      value: input.value,
      minPurchase: input.minPurchase,
      maxUses: input.maxUses,
      maxUsesPerUser: input.maxUsesPerUser ?? 1,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      active: true,
    });
  }

  try {
    const inserted = await db
      .insert(coupons)
      .values(couponsToInsert)
      .returning();
    revalidatePath("/admin/coupons");
    return { coupons: inserted };
  } catch (err: unknown) {
    if (
      typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23505"
    ) {
      return { error: "Ya existe un cupón con ese código" };
    }
    throw err;
  }
}
