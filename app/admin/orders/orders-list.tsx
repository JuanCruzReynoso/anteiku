"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ORDER_STATUS_LABELS } from "@/lib/status-labels";
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

type Order = {
  id: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: Date;
  shippingAddress: { name: string };
};

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
    key: "shippingAddress",
    header: "Cliente",
    type: "text",
    render: (row) => row.shippingAddress?.name ?? "—",
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

export function OrdersList({
  data,
  page,
  totalPages,
  search,
  statusFilter,
}: {
  data: Order[];
  page: number;
  totalPages: number;
  search?: string;
  statusFilter?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(search ?? "");

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
      router.push(`/admin/orders?${params.toString()}`);
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
            placeholder="Buscar por email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter ?? ""}
          onValueChange={(v) => updateParams("status", v === "all" ? "" : (v ?? ""))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DataTable */}
      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        header={{ title: `Ordenes (${data.length})` }}
        empty={{
          title: "Sin ordenes",
          description: "Las ordenes de tus clientes apareceran aqui.",
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
