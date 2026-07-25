"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShipmentActions } from "./shipment-actions-cell";
import { CreateShipmentButton } from "./create-shipment-button";
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

export function ShippingList({
  data,
  total,
  page,
  pageSize,
}: {
  data: ShipmentMethod[];
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
      router.push(`/admin/shipping?${params.toString()}`);
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
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <CreateShipmentButton />
      </div>

      {/* DataTable */}
      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        header={{
          title: `Métodos de envío (${total})`,
        }}
        empty={{
          title: "Sin métodos de envío",
          description:
            "Agregá tu primer método de envío para que los clientes puedan elegir opciones de entrega.",
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
