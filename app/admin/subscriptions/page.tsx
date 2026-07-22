import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { subscriptionPlans, userSubscriptions } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { PlanActions } from "./plan-actions-cell";
import { CreatePlanButton } from "./create-plan-button";

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
  await requireAdmin();

  const plans = await db.query.subscriptionPlans.findMany({
    orderBy: [asc(subscriptionPlans.price)],
  });

  const activeSubscriptions = await db.query.userSubscriptions.findMany({
    orderBy: [desc(userSubscriptions.createdAt)],
    with: { user: true, plan: true },
  });

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Suscripciones</h1>
        <CreatePlanButton />
      </div>

      {/* Plans */}
      <h2 className="text-lg font-semibold mb-4">Planes</h2>
      {plans.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground mb-8">
          <p className="text-lg font-medium">Sin planes</p>
          <p className="text-sm mt-2">
            Agragate tu primer plan de suscripcion para ofrecer cafecito recurrente.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-right px-4 py-3 font-medium">Precio</th>
                <th className="text-left px-4 py-3 font-medium">Intervalo</th>
                <th className="text-left px-4 py-3 font-medium">Features</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(plan.price)}/mes</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {plan.interval === "monthly"
                      ? "Mensual"
                      : plan.interval === "quarterly"
                        ? "Trimestral"
                        : "Anual"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                    {plan.features?.join(", ") ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        plan.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {plan.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PlanActions plan={plan} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Active Subscriptions */}
      <h2 className="text-lg font-semibold mb-4">Suscripciones activas</h2>
      {activeSubscriptions.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">Sin suscripciones activas</p>
          <p className="text-sm mt-2">
            Cuando los clientes se suscriban, apareceran aca.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium">Periodo</th>
                <th className="text-left px-4 py-3 font-medium">Inicio</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {sub.user?.name ?? sub.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">{sub.plan?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : sub.status === "cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {sub.status === "active"
                        ? "Activa"
                        : sub.status === "cancelled"
                          ? "Cancelada"
                          : sub.status === "past_due"
                            ? "Vencida"
                            : "Pausada"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {sub.currentPeriodStart?.toLocaleDateString("es-AR")} -{" "}
                    {sub.currentPeriodEnd?.toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {sub.createdAt?.toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
