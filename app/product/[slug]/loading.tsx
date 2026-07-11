import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-12 md:py-20 animate-fade-in">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-10">
        <Skeleton className="h-3 w-12 rounded-none" />
        <Skeleton className="h-3 w-1 rounded-none" />
        <Skeleton className="h-3 w-10 rounded-none" />
        <Skeleton className="h-3 w-1 rounded-none" />
        <Skeleton className="h-3 w-24 rounded-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        {/* Image skeleton */}
        <Skeleton className="aspect-square w-full rounded-none" />

        {/* Details skeleton */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-3 w-20 rounded-none" />
            <Skeleton className="h-10 w-3/4 rounded-none" />
            <Skeleton className="h-7 w-24 rounded-none" />
          </div>
          <Skeleton className="h-20 w-full rounded-none" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-16 rounded-none" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-16 rounded-full" />
              <Skeleton className="h-10 w-16 rounded-full" />
              <Skeleton className="h-10 w-16 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
