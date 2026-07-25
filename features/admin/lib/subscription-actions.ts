"use server";

import { db } from "@/db";
import { subscriptionPlans, userSubscriptions } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { subscriptionPlanSchema } from "./schemas";

export async function getSubscriptionPlans() {
  await requireAdmin();
  return db.query.subscriptionPlans.findMany({
    orderBy: (plans, { asc }) => [asc(plans.price)],
  });
}

export async function createSubscriptionPlan(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  interval?: string;
  features?: string[];
}) {
  const validated = subscriptionPlanSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [plan] = await db.insert(subscriptionPlans).values(validated.data).returning();
  revalidatePath("/admin/subscriptions");
  return plan;
}

export async function updateSubscriptionPlan(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    interval?: string;
    features?: string[];
    active?: boolean;
  }
) {
  const validated = subscriptionPlanSchema.partial().safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [plan] = await db
    .update(subscriptionPlans)
    .set({ ...validated.data, updatedAt: new Date() })
    .where(eq(subscriptionPlans.id, id))
    .returning();
  revalidatePath("/admin/subscriptions");
  return plan;
}

export async function deleteSubscriptionPlan(id: string) {
  await requireAdmin();
  await db.update(userSubscriptions)
    .set({ status: 'cancelled', cancelAt: new Date() })
    .where(eq(userSubscriptions.planId, id));
  await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  revalidatePath("/admin/subscriptions");
}

export async function checkSlugUnique(slug: string, excludeId?: string) {
  await requireAdmin();
  const plans = await db.query.subscriptionPlans.findMany({
    where: (plans, { eq }) => eq(plans.slug, slug),
  });
  const unique = !plans.some((p) => p.id !== excludeId);
  return { unique };
}

export async function getPlanSubscriberCount(planId: string) {
  await requireAdmin();
  const [result] = await db
    .select({ value: count() })
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.planId, planId),
        eq(userSubscriptions.status, "active")
      )
    );
  return { count: result?.value ?? 0 };
}

export async function toggleSubscriptionPlanActive(id: string) {
  await requireAdmin();
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, id))
    .limit(1);
  if (!plan) return { success: false, error: "Plan no encontrado" };
  const newActive = !plan.active;
  await db
    .update(subscriptionPlans)
    .set({ active: newActive, updatedAt: new Date() })
    .where(eq(subscriptionPlans.id, id));
  revalidatePath("/admin/subscriptions");
  return { success: true, active: newActive };
}

export async function adminPauseSubscription(subscriptionId: string) {
  await requireAdmin();
  const [sub] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.id, subscriptionId))
    .limit(1);
  if (!sub) return { success: false, error: "Suscripción no encontrada" };
  if (sub.status !== "active")
    return { success: false, error: "Solo se pueden pausar suscripciones activas" };
  await db
    .update(userSubscriptions)
    .set({ status: "paused", updatedAt: new Date() })
    .where(eq(userSubscriptions.id, subscriptionId));
  revalidatePath("/admin/subscriptions");
  return { success: true };
}

export async function adminCancelSubscription(subscriptionId: string) {
  await requireAdmin();
  const [sub] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.id, subscriptionId))
    .limit(1);
  if (!sub) return { success: false, error: "Suscripción no encontrada" };
  if (sub.status === "cancelled")
    return { success: false, error: "La suscripción ya está cancelada" };
  await db
    .update(userSubscriptions)
    .set({ status: "cancelled", cancelAt: new Date(), updatedAt: new Date() })
    .where(eq(userSubscriptions.id, subscriptionId));
  revalidatePath("/admin/subscriptions");
  return { success: true };
}

export async function adminResumeSubscription(subscriptionId: string) {
  await requireAdmin();
  const [sub] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.id, subscriptionId))
    .limit(1);
  if (!sub) return { success: false, error: "Suscripción no encontrada" };
  if (sub.status !== "paused")
    return { success: false, error: "Solo se pueden reanudar suscripciones pausadas" };
  await db
    .update(userSubscriptions)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(userSubscriptions.id, subscriptionId));
  revalidatePath("/admin/subscriptions");
  return { success: true };
}

export async function getUserSubscriptions() {
  await requireAdmin();
  return db.query.userSubscriptions.findMany({
    orderBy: (subs, { desc }) => [desc(subs.createdAt)],
    with: { user: true, plan: true },
  });
}
