import { auth } from "@/auth";
import { db } from "@/db";
import { userSubscriptions, subscriptionPlans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function AccountSubscriptionsPage() {
  const session = await auth();

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
    .where(eq(userSubscriptions.userId, session!.user!.id!));

  const statusLabels: Record<string, string> = {
    active: "Activa",
    paused: "Pausada",
    cancelled: "Cancelada",
    past_due: "Pago pendiente",
  };

  if (subscriptions.length === 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold">Suscripciones</h2>
        <div className="bg-muted p-10 text-center space-y-4">
          <p className="text-muted-foreground">
            No tenés suscripciones activas.
          </p>
          <Link
            href="/subscriptions"
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Ver planes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Suscripciones</h2>

      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="bg-muted p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{sub.planName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(sub.planPrice)}/
                  {sub.planInterval === "monthly" ? "mes" : "año"}
                </p>
              </div>
              <span className="text-xs font-medium bg-foreground text-background px-3 py-1">
                {statusLabels[sub.status] || sub.status}
              </span>
            </div>

            {sub.status === "active" && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Periodo actual:{" "}
                  {sub.currentPeriodStart
                    ? new Date(sub.currentPeriodStart).toLocaleDateString("es-AR")
                    : "—"}{" "}
                  —{" "}
                  {sub.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString("es-AR")
                    : "—"}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
