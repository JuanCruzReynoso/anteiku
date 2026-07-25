"use server";

import { db } from "@/db";
import { subscriptionPlans, userSubscriptions, users } from "@/db/schema";
import { eq, and, count, ilike, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { subscriptionPlanSchema } from "./schemas";

export async function getSubscriptionPlans() {
  await requireAdmin();
  return db.query.subscriptionPlans.findMany({
    orderBy: (plans, { asc }) => [asc(plans.price)],
  });
}

/**
 * Fetches subscription plans with search, status filter, and offset-based pagination.
 */
export async function getSubscriptionPlansPaginated(params: {
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
    conditions.push(ilike(subscriptionPlans.name, `%${search}%`));
  }
  if (status) {
    conditions.push(eq(subscriptionPlans.active, status === "active"));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db.query.subscriptionPlans.findMany({
      where,
      orderBy: [desc(subscriptionPlans.createdAt)],
      limit: pageSize,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptionPlans)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  // Fetch subscriber counts per plan
  const subscriberCounts = await db
    .select({
      planId: userSubscriptions.planId,
      count: count(),
    })
    .from(userSubscriptions)
    .where(eq(userSubscriptions.status, "active"))
    .groupBy(userSubscriptions.planId);

  const countMap = new Map(
    subscriberCounts.map((r) => [r.planId, r.count])
  );

  return {
    data: data.map((p) => ({
      ...p,
      featureCount: p.features?.length ?? 0,
      intervalLabel:
        p.interval === "monthly"
          ? "Mensual"
          : p.interval === "quarterly"
            ? "Trimestral"
            : "Anual",
      subscriberCount: countMap.get(p.id) ?? 0,
    })),
    total,
    page,
    pageSize,
  };
}

/**
 * Fetches user subscriptions with search, status filter, and offset-based pagination.
 */
export async function getUserSubscriptionsPaginated(params: {
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
    // Join userSubscriptions → users to search by user name
    const matchingUserIds = db
      .select({ id: users.id })
      .from(users)
      .where(ilike(users.name, `%${search}%`));

    conditions.push(sql`${userSubscriptions.userId} IN (SELECT id FROM (${matchingUserIds}))`);
  }
  if (status) {
    conditions.push(eq(userSubscriptions.status, status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db.query.userSubscriptions.findMany({
      where,
      orderBy: [desc(userSubscriptions.createdAt)],
      limit: pageSize,
      offset,
      with: { user: true, plan: true },
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userSubscriptions)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    data: data.map((s) => ({
      id: s.id,
      userName: s.user?.name ?? s.user?.email ?? "—",
      planName: s.plan?.name ?? "—",
      status: s.status,
      currentPeriodStart: s.currentPeriodStart,
      currentPeriodEnd: s.currentPeriodEnd,
    })),
    total,
    page,
    pageSize,
  };
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
