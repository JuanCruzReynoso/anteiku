"use server";

import { db } from "@/db";
import { users, addresses, subscriptionPlans, userSubscriptions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Schemas ─────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  phone: z.string().optional(),
});

const addressSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  street: z.string().min(1, "La calle es obligatoria"),
  streetNumber: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().min(1, "La ciudad es obligatoria"),
  state: z.string().min(1, "La provincia es obligatoria"),
  postalCode: z.string().min(1, "El código postal es obligatorio"),
  country: z.string().min(1, "El país es obligatorio").default("AR"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ─── Profile Actions ─────────────────────────────────────

export async function updateProfile(data: { name: string; phone?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado." };
  }

  const validated = profileSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  await db
    .update(users)
    .set({ name: validated.data.name, phone: validated.data.phone ?? null })
    .where(eq(users.id, session.user.id));

  revalidatePath("/account");
  return { success: true };
}

// ─── Address Actions ─────────────────────────────────────

export async function getAddresses() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const userAddresses = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.user.id))
    .orderBy(sql`${addresses.isDefault} DESC, ${addresses.createdAt} DESC`);

  return userAddresses.map((a) => ({
    ...a,
    createdAt: a.createdAt ? new Date(a.createdAt) : null,
    updatedAt: a.updatedAt ? new Date(a.updatedAt) : null,
  }));
}

export async function getSavedAddresses() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const userAddresses = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.user.id))
    .orderBy(sql`${addresses.isDefault} DESC, ${addresses.createdAt} DESC`);

  return userAddresses.map((a) => ({
    id: a.id,
    name: a.name,
    line1: `${a.street}${a.streetNumber ? ` ${a.streetNumber}` : ""}`,
    line2: a.apartment || undefined,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    phone: a.phone || undefined,
    isDefault: a.isDefault ?? false,
  }));
}

export async function createAddress(data: AddressInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado." };
  }

  const validated = addressSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // If setting as default, unset all other defaults first
  if (validated.data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, session.user.id));
  }

  const [address] = await db
    .insert(addresses)
    .values({
      userId: session.user.id,
      name: validated.data.name,
      street: validated.data.street,
      streetNumber: validated.data.streetNumber || null,
      apartment: validated.data.apartment || null,
      city: validated.data.city,
      state: validated.data.state,
      postalCode: validated.data.postalCode,
      country: validated.data.country,
      phone: validated.data.phone || null,
      isDefault: validated.data.isDefault ?? false,
    })
    .returning();

  revalidatePath("/account");
  return { address };
}

export async function updateAddress(id: string, data: AddressInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado." };
  }

  const validated = addressSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id)))
    .limit(1);

  if (!existing) {
    return { error: "Dirección no encontrada." };
  }

  // If setting as default, unset all other defaults first
  if (validated.data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, session.user.id));
  }

  await db
    .update(addresses)
    .set({
      name: validated.data.name,
      street: validated.data.street,
      streetNumber: validated.data.streetNumber || null,
      apartment: validated.data.apartment || null,
      city: validated.data.city,
      state: validated.data.state,
      postalCode: validated.data.postalCode,
      country: validated.data.country,
      phone: validated.data.phone || null,
      isDefault: validated.data.isDefault ?? false,
      updatedAt: new Date(),
    })
    .where(eq(addresses.id, id));

  revalidatePath("/account");
  return { success: true };
}

export async function deleteAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado." };
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id)))
    .limit(1);

  if (!existing) {
    return { error: "Dirección no encontrada." };
  }

  await db.delete(addresses).where(eq(addresses.id, id));

  revalidatePath("/account");
  return { success: true };
}

export async function setDefaultAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado." };
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id)))
    .limit(1);

  if (!existing) {
    return { error: "Dirección no encontrada." };
  }

  // Unset all defaults, then set the target as default
  await db
    .update(addresses)
    .set({ isDefault: false })
    .where(eq(addresses.userId, session.user.id));

  await db
    .update(addresses)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(addresses.id, id));

  revalidatePath("/account");
  return { success: true };
}

// ─── Subscription Actions ─────────────────────────────────

export async function enrollInSubscription(planId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado." };
  }

  // Verify plan exists and is active
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(and(eq(subscriptionPlans.id, planId), eq(subscriptionPlans.active, true)))
    .limit(1);

  if (!plan) {
    return { error: "Plan no encontrado o inactivo." };
  }

  // Check if user already has an active subscription to this plan
  const [existingSub] = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.userId, session.user.id),
        eq(userSubscriptions.planId, planId),
        sql`${userSubscriptions.status} IN ('active', 'paused')`
      )
    )
    .limit(1);

  if (existingSub) {
    return { error: "Ya tenés una suscripción activa a este plan." };
  }

  // Calculate period end based on interval
  const now = new Date();
  const periodEnd = new Date(now);
  switch (plan.interval) {
    case "monthly":
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      break;
    case "quarterly":
      periodEnd.setMonth(periodEnd.getMonth() + 3);
      break;
    case "yearly":
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      break;
    default:
      periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const [subscription] = await db
    .insert(userSubscriptions)
    .values({
      userId: session.user.id,
      planId,
      status: "pending_payment",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    })
    .returning();

  revalidatePath("/account/subscriptions");
  revalidatePath("/subscriptions");
  return { subscription };
}
