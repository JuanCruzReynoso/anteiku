"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/components/motion";
import { formatPrice } from "@/lib/utils";
import { getProductDisplayData } from "@/features/product/lib/display";
import { getLowestDiscountedPrice } from "@/features/product/lib/discount";
import type { InferSelectModel } from "drizzle-orm";
import type { discounts } from "@/db/schema";

type Discount = InferSelectModel<typeof discounts>;

/** Compatible with both DB products (category as object) and legacy mock products (category as string) */
export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
  category?: { name: string } | string | null;
  variants: { price: number }[];
  discounts?: Discount[];
}

interface ProductCardProps {
  product: ProductCardProduct;
  index?: number;
  priority?: boolean;
}

function resolveCategoryName(category: ProductCardProduct["category"]): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name;
}

export function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const { minPrice, hasVariants, hasRealImage } = getProductDisplayData(product);
  const categoryName = resolveCategoryName(product.category);
  const prefersReduced = useReducedMotion();

  // Check for discounts
  const discounted = getLowestDiscountedPrice(
    product.variants,
    product.discounts ?? []
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={prefersReduced ? undefined : { scale: 1.02, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block space-y-4">
        {/* Image — rounded corners with hover lift */}
        <div className="aspect-square bg-muted overflow-hidden relative rounded-md transition-shadow duration-300 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
          {hasRealImage ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm"
              aria-hidden="true"
            >
              {categoryName}
            </div>
          )}

          {/* Discount badge */}
          {discounted && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded">
              {discounted.discount.type === "percentage"
                ? `-${discounted.discount.value}%`
                : `-${formatPrice(discounted.discount.value)}`}
            </div>
          )}
        </div>

        {/* Info — editorial style */}
        <div className="space-y-1.5">
          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {discounted ? (
              <>
                <p className="text-xs font-medium text-destructive">
                  {formatPrice(discounted.discountedPrice)}
                </p>
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(discounted.originalPrice)}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {hasVariants
                  ? `Desde ${formatPrice(minPrice)}`
                  : formatPrice(minPrice)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
