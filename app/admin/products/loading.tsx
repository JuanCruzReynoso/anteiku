import { DataTableSkeleton } from "@/components/admin/data-table-skeleton";

export default function AdminProductsLoading() {
  return (
    <div>
      <div className="h-8 w-32 mb-6 rounded bg-muted animate-pulse" />
      <DataTableSkeleton columns={5} rows={5} hasImage hasActions />
    </div>
  );
}
