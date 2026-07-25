"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { DiscountActions } from "./discount-actions-cell";
import { CreateDiscountButton } from "./create-discount-button";
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
  usedCount: number;
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
    key: "usedCount",
    header: "Usos",
    type: "conditional",
    align: "right",
    render: (row) => (
      <span className="tabular-nums">{row.usedCount}</span>
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

export function DiscountsList({
  data,
  total,
  page,
  pageSize,
}: {
  data: DiscountRow[];
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
    if (key !== "page") {
      params.delete("page");
    }
    startTransition(() => {
      router.push(`/admin/discounts?${params.toString()}`);
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
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        <CreateDiscountButton />
      </div>

      {/* DataTable */}
      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        header={{
          title: `Descuentos (${total})`,
        }}
        empty={{
          title: "Sin descuentos",
          description: "Agragate tu primer descuento para ofrecer precios especiales.",
        }}
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
