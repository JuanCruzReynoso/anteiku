"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductActions } from "./product-actions-cell";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

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

const actions: ActionConfig<ProductRow> = {
  type: "icon-buttons",
  component: ({ row }) => (
    <ProductActions productId={row.id} status={row.status} />
  ),
};

export function ProductsList({
  data,
  total,
  page,
  pageSize,
}: {
  data: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const totalPages = Math.ceil(total / pageSize);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change (except when navigating pages)
    if (key !== "page") {
      params.delete("page");
    }
    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`);
    });
  }

  function handleSearch() {
    updateParams("search", searchInput);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={searchParams.get("status") ?? ""}
          onValueChange={(v) => updateParams("status", v === "all" ? "" : (v ?? ""))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DataTable */}
      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        header={{
          title: `Productos (${total})`,
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => updateParams("page", String(page - 1))}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => updateParams("page", String(page + 1))}
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
