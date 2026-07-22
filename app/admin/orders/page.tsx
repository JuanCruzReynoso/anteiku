import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ORDER_STATUS_LABELS } from "@/lib/status-labels";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";

type Order = {
  id: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: Date;
};

export const dynamic = "force-dynamic";

const columns: Column<Order>[] = [
  {
    key: "id",
    header: "#",
    type: "monospace",
    fontWeight: "bold",
    render: (row) => (
      <span className="font-mono text-xs font-medium">{row.id.slice(0, 8)}</span>
    ),
  },
  {
    key: "customerEmail",
    header: "Cliente",
    type: "text",
  },
  {
    key: "total",
    header: "Total",
    type: "currency",
  },
  {
    key: "status",
    header: "Estado",
    type: "badge",
    badgeMap: {
      pending: {
        label: ORDER_STATUS_LABELS.pending ?? "Pendiente",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
      paid: {
        label: ORDER_STATUS_LABELS.paid ?? "Pagado",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      shipped: {
        label: ORDER_STATUS_LABELS.shipped ?? "Enviado",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      },
      delivered: {
        label: ORDER_STATUS_LABELS.delivered ?? "Entregado",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      cancelled: {
        label: ORDER_STATUS_LABELS.cancelled ?? "Cancelado",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      },
    },
  },
  {
    key: "createdAt",
    header: "Fecha",
    type: "date",
  },
];

const actions: ActionConfig<Order> = {
  type: "link",
  href: (row) => `/admin/orders/${row.id}`,
  label: "Ver detalle",
};

export default async function AdminOrders() {
  await requireAdmin();

  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
  });

  return (
    <DataTable
      data={allOrders}
      columns={columns}
      actions={actions}
      header={{ title: "Ordenes" }}
      empty={{
        title: "Sin ordenes",
        description: "Las ordenes de tus clientes apareceran aqui.",
      }}
      keyExtractor={(row) => row.id}
    />
  );
}
