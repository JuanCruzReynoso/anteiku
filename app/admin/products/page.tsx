import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProductActions } from "./product-actions-cell";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  categoryName: string;
  basePrice: number;
  status: string;
  imageUrl: string | null;
};

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  active: {
    label: "Activo",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  draft: {
    label: "Borrador",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  inactive: {
    label: "Inactivo",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
};

const columns: Column<ProductRow>[] = [
  {
    key: "imageUrl",
    header: "Imagen",
    type: "image",
    hideOnMobile: true,
  },
  {
    key: "name",
    header: "Nombre",
    type: "text",
    fontWeight: "bold",
  },
  {
    key: "categoryName",
    header: "Categoría",
    type: "text",
  },
  {
    key: "basePrice",
    header: "Precio",
    type: "currency",
  },
  {
    key: "status",
    header: "Estado",
    type: "badge",
    badgeMap: statusBadgeMap,
  },
];

export default async function AdminProducts() {
  await requireAdmin();

  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { category: true },
  });

  const data: ProductRow[] = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: p.category?.name ?? "Sin categoría",
    basePrice: p.basePrice,
    status: p.status,
    imageUrl: p.images?.[0] ?? null,
  }));

  const actions: ActionConfig<ProductRow> = {
    type: "icon-buttons",
    component: ({ row }) => (
      <ProductActions productId={row.id} status={row.status} />
    ),
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      actions={actions}
      header={{
        title: "Productos",
        cta: (
          <a
            href="/admin/products/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            + Agregar producto
          </a>
        ),
      }}
      empty={{
        title: "Sin productos",
        description: "Creá tu primer producto para empezar a vender.",
      }}
      rowClassName={(row) => (row.status === "inactive" ? "opacity-60" : "")}
      keyExtractor={(row) => row.id}
    />
  );
}
