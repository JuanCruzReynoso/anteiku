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

      <DataTableSkeleton columns={5} rows={5} hasActions />
    </div>
  );
}
