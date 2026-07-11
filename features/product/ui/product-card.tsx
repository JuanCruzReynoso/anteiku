import Link from "next/link";
import type { Product } from "../lib/mock-data";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const hasVariants = product.variants.length > 1;

  return (
    <Link href={`/product/${product.slug}`} className="group block space-y-3">
      {/* Image */}
      <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
        {/* Placeholder — replace with real product images */}
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          {product.category}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm group-hover:underline">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasVariants
            ? `Desde ${formatPrice(minPrice)}`
            : formatPrice(minPrice)}
        </p>
      </div>
    </Link>
  );
}
