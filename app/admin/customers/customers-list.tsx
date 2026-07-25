"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";
import { ROLE_LABELS } from "@/lib/status-labels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type CustomerRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: Date | null;
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
    key: "role",
    header: "Rol",
    type: "badge",
    badgeMap: ROLE_LABELS,
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
  page,
  totalPages,
  search,
  total,
}: {
  data: CustomerRow[];
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  page: number;
  totalPages: number;
  search: string;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(search);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/admin/customers?${params.toString()}`);
  }, [searchInput, searchParams, router]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`/admin/customers?${params.toString()}`);
    },
    [searchParams, router]
  );

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

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-9"
          />
        </div>
        <Button variant="secondary" onClick={handleSearch}>
          Buscar
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        empty={{
          title: search ? "No se encontraron clientes" : "Sin clientes",
          description: search
            ? "No hay clientes que coincidan con la busqueda."
            : "Los clientes que se registren apareceran aqui.",
        }}
        keyExtractor={(row) => row.id}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * 20 + 1}-
            {Math.min(page * 20, total)} de {total} clientes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Pagina {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
