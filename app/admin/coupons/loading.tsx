import { DataTableSkeleton } from "@/components/admin/data-table-skeleton";

export default function AdminCouponsLoading() {
  return (
    <div>
      <div className="h-8 w-28 mb-6 rounded bg-muted animate-pulse" />
      <DataTableSkeleton columns={7} rows={5} hasActions />
    </div>
  );
}
