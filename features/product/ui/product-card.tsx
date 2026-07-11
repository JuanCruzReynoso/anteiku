import Image from "next/image";
import Link from "next/link";
import type { Product } from "../lib/mock-data";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const hasVariants = product.variants.length > 1;
  const hasRealImage = product.images[0] && !product.images[0].startsWith("/placeholder");

  return (
    <article>
      <Link href={`/product/${product.slug}`} className="group block space-y-4">
        {/* Image — borderless, full bleed */}
        <div className="aspect-square bg-muted overflow-hidden relative">
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
          <h3 className="font-medium text-sm group-hover:opacity-70 transition-opacity">
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
