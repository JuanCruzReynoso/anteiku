import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrdersLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />

      <div className="border rounded-lg">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 p-4 border-b">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 items-center"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
