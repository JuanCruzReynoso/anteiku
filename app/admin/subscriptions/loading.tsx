import { DataTableSkeleton } from "@/components/admin/data-table-skeleton";

export default function AdminSubscriptionsLoading() {
  return (
    <div>
      <div className="h-8 w-40 mb-6 rounded bg-muted animate-pulse" />

      {/* Plans skeleton */}
      <div className="h-5 w-16 mb-4 rounded bg-muted animate-pulse" />
      <DataTableSkeleton columns={5} rows={3} hasActions />

      <div className="h-8" />

      {/* Active subs skeleton */}
      <div className="h-5 w-48 mb-4 rounded bg-muted animate-pulse" />
      <DataTableSkeleton columns={5} rows={3} />
    </div>
  );
}
