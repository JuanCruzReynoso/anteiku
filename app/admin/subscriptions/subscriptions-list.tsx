"use client";

import { formatPrice } from "@/lib/utils";
import { PlanActions } from "./plan-actions-cell";
import { CreatePlanButton } from "./create-plan-button";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";

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
    render: (row) => <span>{formatPrice(row.price)}/mes</span>,
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

const subActions: ActionConfig<ActiveSubRow> = {
  type: "none",
};

export function SubscriptionsList({
  plans,
  subscriptions,
}: {
  plans: PlanRow[];
  subscriptions: ActiveSubRow[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Suscripciones</h1>
        <CreatePlanButton />
      </div>

      {/* Plans */}
      <DataTable
        data={plans}
        columns={planColumns}
        actions={planActions}
        header={{ title: "Planes" }}
        empty={{
          title: "Sin planes",
          description:
            "Agragate tu primer plan de suscripcion para ofrecer cafecito recurrente.",
        }}
        keyExtractor={(row) => row.id}
      />

      <div className="mt-8" />

      {/* Active Subscriptions */}
      <DataTable
        data={subscriptions}
        columns={subColumns}
        actions={subActions}
        header={{ title: "Suscripciones activas" }}
        empty={{
          title: "Sin suscripciones activas",
          description:
            "Cuando los clientes se suscriban, apareceran aca.",
        }}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}
