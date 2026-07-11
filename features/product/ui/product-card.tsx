import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Product } from "../lib/mock-data";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const hasVariants = product.variants.length > 1;
  const hasRealImage = product.images[0] && !product.images[0].startsWith("/placeholder");

  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block space-y-4">
        {/* Image — borderless, full bleed with hover lift */}
        <div className="aspect-square bg-muted overflow-hidden relative transition-shadow duration-300 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {hasRealImage ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm"
              aria-hidden="true"
            >
              {product.category}
            </div>
          )}
        </div>

        {/* Info — editorial style */}
        <div className="space-y-1.5">
          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {hasVariants
              ? `Desde ${formatPrice(minPrice)}`
              : formatPrice(minPrice)}
          </p>
        </div>
      </Link>
    </article>
  );
}
