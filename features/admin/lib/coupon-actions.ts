"use server";

import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { couponSchema } from "./schemas";

export async function getCoupons() {
  await requireAdmin();
  return db.query.coupons.findMany({
    orderBy: (coupons, { desc }) => [desc(coupons.createdAt)],
  });
}

export async function validateCoupon(code: string, purchaseAmount: number) {
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
  startsAt?: Date;
  endsAt?: Date;
}) {
  const validated = couponSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [coupon] = await db
    .insert(coupons)
    .values({ ...validated.data, code: validated.data.code.toUpperCase() })
    .returning();
  revalidatePath("/admin/coupons");
  return coupon;
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
