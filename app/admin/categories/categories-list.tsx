"use client";

import { CategoryActions } from "./category-actions-cell";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";

type CategoryRow = {
  id: string;
  sortOrder: number | null;
  name: string;
  slug: string;
  productCount: number;
  active: boolean | null;
};

const columns: Column<CategoryRow>[] = [
  {
    key: "sortOrder",
    header: "Orden",
    type: "count",
    align: "right",
    hideOnMobile: true,
  },
  {
    key: "name",
    header: "Nombre",
    type: "text",
    fontWeight: "bold",
  },
  {
    key: "slug",
    header: "Slug",
    type: "monospace",
  },
  {
    key: "productCount",
    header: "Productos",
    type: "count",
    align: "right",
  },
  {
    key: "active",
    header: "Estado",
    type: "badge",
    badgeMap: {
      true: {
        label: "Activa",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      false: {
        label: "Inactiva",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      },
    },
  },
];

const actions: ActionConfig<CategoryRow> = {
  type: "text-buttons",
  component: ({ row }) => <CategoryActions categoryId={row.id} />,
};

export function CategoriesList({ data }: { data: CategoryRow[] }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      actions={actions}
      header={{
        title: "Categorías",
        cta: (
          <a
            href="/admin/categories/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            + Agregar categoría
          </a>
        ),
      }}
      empty={{
        title: "Sin categorías",
        description: "Creá tu primera categoría para organizar los productos.",
      }}
      keyExtractor={(row) => row.id}
    />
  );
}
