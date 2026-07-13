"use server";

import { db } from "@/db";
import { subscriptionPlans, userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  revalidatePath("/admin/subscriptions");
}

export async function getUserSubscriptions() {
  await requireAdmin();
  return db.query.userSubscriptions.findMany({
    orderBy: (subs, { desc }) => [desc(subs.createdAt)],
    with: { user: true, plan: true },
  });
}
