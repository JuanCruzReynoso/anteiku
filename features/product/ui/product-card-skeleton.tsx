import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <article className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-none" />
        <Skeleton className="h-3 w-1/2 rounded-none" />
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
