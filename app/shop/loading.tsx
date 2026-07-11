import { ProductGridSkeleton } from "@/features/product/ui/product-card-skeleton";

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 animate-fade-in">
      <div className="mb-12 space-y-4">
        <div className="h-3 w-24 bg-muted rounded-full animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded-full animate-pulse" />
        <div className="h-4 w-20 bg-muted rounded-full animate-pulse" />
      </div>

      <div className="flex flex-wrap gap-2 mb-16">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-muted rounded-full animate-pulse" />
        ))}
      </div>

      <ProductGridSkeleton count={6} />
    </div>
  );
}
