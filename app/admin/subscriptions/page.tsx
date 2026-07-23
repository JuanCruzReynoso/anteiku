import { db } from "@/db";
import { subscriptionPlans, userSubscriptions } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { SubscriptionsList } from "./subscriptions-list";

export const dynamic = "force-dynamic";

export type SubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[];
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AdminSubscriptions() {
  const plans = await db.query.subscriptionPlans.findMany({
    orderBy: [asc(subscriptionPlans.price)],
  });

  const activeSubscriptions = await db.query.userSubscriptions.findMany({
    orderBy: [desc(userSubscriptions.createdAt)],
    with: { user: true, plan: true },
  });

  const planData = plans.map((p) => ({
    ...p,
    featureCount: p.features?.length ?? 0,
    intervalLabel:
      p.interval === "monthly"
        ? "Mensual"
        : p.interval === "quarterly"
          ? "Trimestral"
          : "Anual",
  }));

  const subData = activeSubscriptions.map((s) => ({
    id: s.id,
    userName: s.user?.name ?? s.user?.email ?? "—",
    planName: s.plan?.name ?? "—",
    status: s.status,
    currentPeriodStart: s.currentPeriodStart,
    currentPeriodEnd: s.currentPeriodEnd,
  }));

  return <SubscriptionsList plans={planData} subscriptions={subData} />;
}
