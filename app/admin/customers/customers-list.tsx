"use client";

import { formatPrice } from "@/lib/utils";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";

type CustomerRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
};

const columns: Column<CustomerRow>[] = [
  {
    key: "name",
    header: "Nombre",
    type: "text",
    fontWeight: "bold",
    fallback: "—",
  },
  {
    key: "email",
    header: "Email",
    type: "text",
  },
  {
    key: "phone",
    header: "Telefono",
    type: "text",
    hideOnMobile: true,
  },
  {
    key: "orderCount",
    header: "Total ordenes",
    type: "count",
    align: "right",
  },
  {
    key: "totalSpent",
    header: "Total gastado",
    type: "currency",
    align: "right",
  },
];

const actions: ActionConfig<CustomerRow> = {
  type: "link",
  href: (row) => `/admin/customers/${row.id}`,
  label: "Ver perfil",
};

export function CustomersList({
  data,
  totalCustomers,
  totalOrders,
  totalRevenue,
}: {
  data: CustomerRow[];
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total clientes</p>
          <p className="text-2xl font-bold">{totalCustomers}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total ordenes</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Ingresos totales</p>
          <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        empty={{
          title: "Sin clientes",
          description: "Los clientes que se registren apareceran aqui.",
        }}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}
