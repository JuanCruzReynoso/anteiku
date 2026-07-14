"use server";

import { db } from "@/db";
import { userSubscriptions, subscriptionPlans } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export interface UserSubscription {
  id: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  planName: string;
  planPrice: number;
  planInterval: string;
}

export async function getUserSubscriptions(): Promise<UserSubscription[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const subscriptions = await db
    .select({
      id: userSubscriptions.id,
      status: userSubscriptions.status,
      currentPeriodStart: userSubscriptions.currentPeriodStart,
      currentPeriodEnd: userSubscriptions.currentPeriodEnd,
      planName: subscriptionPlans.name,
      planPrice: subscriptionPlans.price,
      planInterval: subscriptionPlans.interval,
    })
    .from(userSubscriptions)
    .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(eq(userSubscriptions.userId, session.user.id));

  return subscriptions.map((s) => ({
    ...s,
    currentPeriodStart: s.currentPeriodStart ? new Date(s.currentPeriodStart) : null,
    currentPeriodEnd: s.currentPeriodEnd ? new Date(s.currentPeriodEnd) : null,
  }));
}

export async function cancelSubscription(subscriptionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado." };
  }

  // Verify ownership
  const [sub] = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.id, subscriptionId),
        eq(userSubscriptions.userId, session.user.id)
      )
    )
    .limit(1);

  if (!sub) {
    return { error: "Suscripción no encontrada." };
  }

  if (sub.status === "cancelled") {
    return { error: "La suscripción ya está cancelada." };
  }

  await db
    .update(userSubscriptions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(userSubscriptions.id, subscriptionId));

  return { success: true };
}

export async function pauseSubscription(subscriptionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado." };
  }

  const [sub] = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.id, subscriptionId),
        eq(userSubscriptions.userId, session.user.id)
      )
    )
    .limit(1);

  if (!sub) {
    return { error: "Suscripción no encontrada." };
  }

  if (sub.status !== "active") {
    return { error: "Solo se pueden pausar suscripciones activas." };
  }

  await db
    .update(userSubscriptions)
    .set({ status: "paused", updatedAt: new Date() })
    .where(eq(userSubscriptions.id, subscriptionId));

  return { success: true };
}

export async function resumeSubscription(subscriptionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tenés que estar logueado." };
  }

  const [sub] = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.id, subscriptionId),
        eq(userSubscriptions.userId, session.user.id)
      )
    )
    .limit(1);

  if (!sub) {
    return { error: "Suscripción no encontrada." };
  }

  if (sub.status !== "paused") {
    return { error: "Solo se pueden reanudar suscripciones pausadas." };
  }

  await db
    .update(userSubscriptions)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(userSubscriptions.id, subscriptionId));

  return { success: true };
}
