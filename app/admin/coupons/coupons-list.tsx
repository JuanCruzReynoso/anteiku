"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { CouponActions } from "./coupon-actions-cell";
import { CreateCouponButton } from "./create-coupon-button";
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

export type Coupon = {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

type CouponRow = Coupon & {
  dateRange: string;
};

const columns: Column<CouponRow>[] = [
  {
    key: "code",
    header: "Codigo",
    type: "monospace",
    fontWeight: "bold",
  },
  {
    key: "name",
    header: "Nombre",
    type: "text",
  },
  {
    key: "type",
    header: "Tipo",
    type: "text",
    render: (row) => (
      <span className="text-muted-foreground">
        {row.type === "percentage"
          ? "Porcentaje"
          : row.type === "fixed"
            ? "Fijo"
            : "Envio gratis"}
      </span>
    ),
  },
  {
    key: "value",
    header: "Valor",
    type: "conditional",
    align: "right",
    render: (row) =>
      row.type === "percentage"
        ? `${row.value}%`
        : row.type === "free_shipping"
          ? "—"
          : formatPrice(row.value),
  },
  {
    key: "usedCount",
    header: "Usos",
    type: "conditional",
    align: "right",
    render: (row) => (
      <span className="tabular-nums">
        {row.usedCount}
        {row.maxUses ? ` / ${row.maxUses}` : " / ∞"}
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

const actions: ActionConfig<CouponRow> = {
  type: "text-buttons",
  component: ({ row }) => <CouponActions coupon={row} />,
};

export function CouponsList({
  data,
  total,
  page,
  pageSize,
}: {
  data: CouponRow[];
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
      router.push(`/admin/coupons?${params.toString()}`);
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
            placeholder="Buscar por código o nombre..."
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
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <CreateCouponButton />
      </div>

      {/* DataTable */}
      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        header={{
          title: `Cupones (${total})`,
        }}
        empty={{
          title: "Sin cupones",
          description: "Agragate tu primer cupon para ofrecer descuentos por codigo.",
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
