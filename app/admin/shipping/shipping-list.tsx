"use client";

import { ShipmentActions } from "./shipment-actions-cell";
import { CreateShipmentButton } from "./create-shipment-button";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";

export type ShipmentMethod = {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  estimatedDays: number;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

const columns: Column<ShipmentMethod>[] = [
  {
    key: "name",
    header: "Nombre",
    type: "text",
    fontWeight: "bold",
  },
  {
    key: "description",
    header: "Descripción",
    type: "text",
    hideOnMobile: true,
  },
  {
    key: "cost",
    header: "Costo",
    type: "currency",
    align: "right",
  },
  {
    key: "estimatedDays",
    header: "Días estimados",
    type: "count",
    suffix: "días",
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

const actions: ActionConfig<ShipmentMethod> = {
  type: "text-buttons",
  component: ({ row }) => <ShipmentActions method={row} />,
};

export function ShippingList({ data }: { data: ShipmentMethod[] }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      actions={actions}
      header={{
        title: "Métodos de envío",
        cta: <CreateShipmentButton />,
      }}
      empty={{
        title: "Sin métodos de envío",
        description:
          "Agregá tu primer método de envío para que los clientes puedan elegir opciones de entrega.",
      }}
      keyExtractor={(row) => row.id}
    />
  );
}
