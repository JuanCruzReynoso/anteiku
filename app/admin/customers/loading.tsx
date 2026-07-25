import { DataTableSkeleton } from "@/components/admin/data-table-skeleton";

export default function AdminCustomersLoading() {
  return (
    <div>
      <div className="h-8 w-32 mb-6 rounded bg-muted animate-pulse" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-4 w-24 mb-2 rounded bg-muted animate-pulse" />
            <div className="h-7 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* Search skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-10 w-80 rounded bg-muted animate-pulse" />
        <div className="h-10 w-20 rounded bg-muted animate-pulse" />
      </div>

      <DataTableSkeleton columns={6} rows={5} hasActions />

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-4">
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-8 w-8 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
