"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { PlanActions } from "./plan-actions-cell";
import { CreatePlanButton } from "./create-plan-button";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  adminPauseSubscription,
  adminCancelSubscription,
  adminResumeSubscription,
} from "@/features/admin/lib/subscription-actions";

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

type PlanRow = SubscriptionPlan & {
  featureCount: number;
  intervalLabel: string;
  subscriberCount: number;
};

type ActiveSubRow = {
  id: string;
  userName: string;
  planName: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
};

const planColumns: Column<PlanRow>[] = [
  {
    key: "name",
    header: "Nombre",
    type: "text",
    fontWeight: "bold",
  },
  {
    key: "price",
    header: "Precio",
    type: "currency",
    align: "right",
    render: (row) => (
      <span>
        {formatPrice(row.price)}/
        {row.interval === "monthly"
          ? "mes"
          : row.interval === "quarterly"
            ? "trimestre"
            : "año"}
      </span>
    ),
  },
  {
    key: "intervalLabel",
    header: "Intervalo",
    type: "text",
    render: (row) => (
      <span className="capitalize">{row.intervalLabel}</span>
    ),
  },
  {
    key: "featureCount",
    header: "Features",
    type: "count",
    render: (row) => (
      <span className="text-muted-foreground text-xs max-w-[200px] truncate block">
        {row.features?.join(", ") ?? "—"}
      </span>
    ),
    hideOnMobile: true,
  },
  {
    key: "subscriberCount",
    header: "Suscriptores",
    type: "count",
    align: "right",
  },
  {
    key: "active",
    header: "Estado",
    type: "badge",
    badgeMap: {
      true: {
        label: "Activo",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      false: {
        label: "Inactivo",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      },
    },
  },
];

const subColumns: Column<ActiveSubRow>[] = [
  {
    key: "userName",
    header: "Cliente",
    type: "text",
    fontWeight: "bold",
  },
  {
    key: "planName",
    header: "Plan",
    type: "text",
  },
  {
    key: "status",
    header: "Estado",
    type: "badge",
    badgeMap: {
      active: {
        label: "Activa",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      cancelled: {
        label: "Cancelada",
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      },
      past_due: {
        label: "Vencida",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      },
      paused: {
        label: "Pausada",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      },
    },
  },
  {
    key: "currentPeriodStart",
    header: "Periodo",
    type: "text",
    hideOnMobile: true,
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.currentPeriodStart?.toLocaleDateString("es-AR")} -{" "}
        {row.currentPeriodEnd?.toLocaleDateString("es-AR")}
      </span>
    ),
  },
];

const planActions: ActionConfig<PlanRow> = {
  type: "text-buttons",
  component: ({ row }) => <PlanActions plan={row} />,
};

function SubscriptionActions({ subscription }: { subscription: ActiveSubRow }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    fn: () => Promise<{ success: boolean; error?: string }>;
    label: string;
  } | null>(null);

  const handleAction = async (
    fn: () => Promise<{ success: boolean; error?: string }>,
    label: string
  ) => {
    setPendingAction({ fn, label });
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    const result = await pendingAction.fn();
    if (result.success) {
      toast.success(
        pendingAction.label === "Pausar"
          ? "Suscripción pausada"
          : pendingAction.label === "Cancelar"
            ? "Suscripción cancelada"
            : "Suscripción reanudada"
      );
      router.refresh();
    } else {
      toast.error(result.error ?? "Error al ejecutar la acción");
    }
    setShowConfirm(false);
    setPendingAction(null);
  };

  const status = subscription.status;

  if (status === "cancelled") return null;

  return (
    <div className="flex gap-2 justify-end">
      {status === "active" && (
        <button
          onClick={() =>
            handleAction(
              () => adminPauseSubscription(subscription.id),
              "Pausar"
            )
          }
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Pausar
        </button>
      )}
      {status === "paused" && (
        <button
          onClick={() =>
            handleAction(
              () => adminResumeSubscription(subscription.id),
              "Reanudar"
            )
          }
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Reanudar
        </button>
      )}
      <button
        onClick={() =>
          handleAction(
            () => adminCancelSubscription(subscription.id),
            "Cancelar"
          )
        }
        className="text-sm text-destructive hover:text-destructive/80"
      >
        Cancelar
      </button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.label ?? "Confirmar acción"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.label === "Cancelar"
                ? "Esta acción cancelará la suscripción permanentemente. ¿Estás seguro?"
                : `¿Estás seguro que querés ${pendingAction?.label?.toLowerCase()} esta suscripción?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>
              No, mantener
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {pendingAction?.label ?? "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const subActions: ActionConfig<ActiveSubRow> = {
  type: "text-buttons",
  component: ({ row }) => <SubscriptionActions subscription={row} />,
};

export function SubscriptionsList({
  plans,
  plansTotal,
  planPage,
  subscriptions,
  subsTotal,
  subPage,
  pageSize,
}: {
  plans: PlanRow[];
  plansTotal: number;
  planPage: number;
  subscriptions: ActiveSubRow[];
  subsTotal: number;
  subPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [isPendingPlans, setIsPendingPlans] = useState(false);
  const [isPendingSubs, setIsPendingSubs] = useState(false);
  const [planSearchInput, setPlanSearchInput] = useState("");
  const [subSearchInput, setSubSearchInput] = useState("");

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset the relevant page param when filters change
    if (key === "planSearch" || key === "planStatus") {
      params.delete("planPage");
    }
    if (key === "subSearch" || key === "subStatus") {
      params.delete("subPage");
    }
    router.push(`/admin/subscriptions?${params.toString()}`);
  }

  function updatePlanParams(key: string, value: string) {
    updateParams(key, value);
  }

  function updateSubParams(key: string, value: string) {
    updateParams(key, value);
  }

  const planTotalPages = Math.ceil(plansTotal / pageSize);
  const subTotalPages = Math.ceil(subsTotal / pageSize);

  // Get URL search params for initial values
  const planStatus = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("planStatus") ?? ""
    : "";
  const subStatus = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("subStatus") ?? ""
    : "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Suscripciones</h1>
        <CreatePlanButton />
      </div>

      {/* Plans Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              placeholder="Buscar por nombre de plan..."
              value={planSearchInput}
              onChange={(e) => setPlanSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updatePlanParams("planSearch", planSearchInput);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          </div>
          <select
            value={planStatus}
            onChange={(e) => updatePlanParams("planStatus", e.target.value)}
            className="flex h-9 w-[160px] items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <DataTable
          data={plans}
          columns={planColumns}
          actions={planActions}
          header={{ title: `Planes (${plansTotal})` }}
          empty={{
            title: "Sin planes",
            description:
              "Agragate tu primer plan de suscripcion para ofrecer cafecito recurrente.",
          }}
          keyExtractor={(row) => row.id}
        />

        {planTotalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {planPage} de {planTotalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={planPage <= 1}
                onClick={() => updatePlanParams("planPage", String(planPage - 1))}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
              >
                ← Anterior
              </button>
              <button
                disabled={planPage >= planTotalPages}
                onClick={() => updatePlanParams("planPage", String(planPage + 1))}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8" />

      {/* Active Subscriptions Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              placeholder="Buscar por nombre de cliente..."
              value={subSearchInput}
              onChange={(e) => setSubSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateSubParams("subSearch", subSearchInput);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          </div>
          <select
            value={subStatus}
            onChange={(e) => updateSubParams("subStatus", e.target.value)}
            className="flex h-9 w-[160px] items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todos</option>
            <option value="active">Activas</option>
            <option value="cancelled">Canceladas</option>
            <option value="past_due">Vencidas</option>
            <option value="paused">Pausadas</option>
          </select>
        </div>

        <DataTable
          data={subscriptions}
          columns={subColumns}
          actions={subActions}
          header={{ title: `Suscripciones activas (${subsTotal})` }}
          empty={{
            title: "Sin suscripciones activas",
            description:
              "Cuando los clientes se suscriban, apareceran aca.",
          }}
          keyExtractor={(row) => row.id}
        />

        {subTotalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {subPage} de {subTotalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={subPage <= 1}
                onClick={() => updateSubParams("subPage", String(subPage - 1))}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
              >
                ← Anterior
              </button>
              <button
                disabled={subPage >= subTotalPages}
                onClick={() => updateSubParams("subPage", String(subPage + 1))}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
