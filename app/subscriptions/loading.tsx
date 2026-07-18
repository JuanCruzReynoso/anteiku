import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionsLoading() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 animate-fade-in">
      <div className="mb-12 space-y-4 text-center">
        <Skeleton className="h-3 w-24 bg-muted rounded-full mx-auto" />
        <Skeleton className="h-10 w-56 bg-muted rounded-full mx-auto" />
        <Skeleton className="h-4 w-72 bg-muted rounded-full mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
