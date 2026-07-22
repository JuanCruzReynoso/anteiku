import { DataTableSkeleton } from "@/components/admin/data-table-skeleton";

export default function AdminDiscountsLoading() {
  return (
    <div>
      <div className="h-8 w-32 mb-6 rounded bg-muted animate-pulse" />
      <DataTableSkeleton columns={6} rows={5} hasActions />
    </div>
  );
}
