import { DataTableSkeleton } from "@/components/admin/data-table-skeleton";

export default function AdminShippingLoading() {
  return (
    <div>
      <div className="h-8 w-40 mb-6 rounded bg-muted animate-pulse" />
      <DataTableSkeleton columns={5} rows={5} hasActions />
    </div>
  );
}
