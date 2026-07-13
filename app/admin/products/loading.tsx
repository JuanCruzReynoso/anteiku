import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />

      <div className="border rounded-lg">
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b">
          <Skeleton className="h-4 col-span-2" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 p-4 border-b last:border-b-0 items-center"
          >
            <div className="col-span-2 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
