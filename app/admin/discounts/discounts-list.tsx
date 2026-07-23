"use client";

import { formatPrice } from "@/lib/utils";
import { DiscountActions } from "./discount-actions-cell";
import { CreateDiscountButton } from "./create-discount-button";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";

export type Discount = {
  id: string;
  name: string;
  type: string;
  value: number;
  productId: string | null;
  categoryId: string | null;
  minPurchase: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

type DiscountRow = Discount & {
  productName: string | null;
  categoryName: string | null;
  dateRange: string;
};

const columns: Column<DiscountRow>[] = [
  {
    key: "name",
    header: "Nombre",
    type: "text",
    fontWeight: "bold",
  },
  {
    key: "type",
    header: "Tipo",
    type: "text",
    render: (row) => (
      <span className="text-muted-foreground">
        {row.type === "percentage" ? "Porcentaje" : "Fijo"}
      </span>
    ),
  },
  {
    key: "value",
    header: "Valor",
    type: "conditional",
    align: "right",
    render: (row) =>
      row.type === "percentage" ? `${row.value}%` : formatPrice(row.value),
  },
  {
    key: "productName",
    header: "Producto/Categoria",
    type: "text",
    render: (row) => (
      <span className="text-muted-foreground">
        {row.productName ?? row.categoryName ?? "—"}
      </span>
    ),
  },
  {
    key: "dateRange",
    header: "Vigencia",
    type: "text",
    hideOnMobile: true,
    render: (row) => (
      <span className="text-muted-foreground text-xs">{row.dateRange}</span>
    ),
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

const actions: ActionConfig<DiscountRow> = {
  type: "inline-modal",
  component: ({ row }) => <DiscountActions discount={row} />,
};

export function DiscountsList({ data }: { data: DiscountRow[] }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      actions={actions}
      header={{
        title: "Descuentos",
        cta: <CreateDiscountButton />,
      }}
      empty={{
        title: "Sin descuentos",
        description: "Agragate tu primer descuento para ofrecer precios especiales.",
      }}
      keyExtractor={(row) => row.id}
    />
  );
}
