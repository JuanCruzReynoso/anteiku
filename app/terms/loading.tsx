import { Skeleton } from "@/components/ui/skeleton";

export default function TermsLoading() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-3 w-24 bg-muted rounded-full" />
          <Skeleton className="h-10 w-56 bg-muted rounded-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
