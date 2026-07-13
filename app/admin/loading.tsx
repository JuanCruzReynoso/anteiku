import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />

      {/* First row: 4 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Second row: 3 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Welcome card */}
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
    </div>
  );
}
