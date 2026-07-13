import type { InferSelectModel } from "drizzle-orm";
import type { discounts } from "@/db/schema";

type Discount = InferSelectModel<typeof discounts>;

/**
 * Calculate the discounted price for a product.
 * Returns { originalPrice, discountedPrice, discount } or null if no discount applies.
 */
export function getDiscountedPrice(
  basePrice: number,
  productDiscounts: Discount[],
  now: Date = new Date()
): { originalPrice: number; discountedPrice: number; discount: Discount } | null {
  // Filter active discounts within date range
  const activeDiscount = productDiscounts.find((d) => {
    if (!d.active) return false;
    if (d.startsAt && now < d.startsAt) return false;
    if (d.endsAt && now > d.endsAt) return false;
    return true;
  });

  if (!activeDiscount) return null;

  let discountedPrice: number;

  if (activeDiscount.type === "percentage") {
    // Percentage discount: value is 0-100
    const discountAmount = Math.round(basePrice * (activeDiscount.value / 100));
    discountedPrice = basePrice - discountAmount;
  } else {
    // Fixed discount: value is ARS amount
    discountedPrice = Math.max(0, basePrice - activeDiscount.value);
  }

  return {
    originalPrice: basePrice,
    discountedPrice,
    discount: activeDiscount,
  };
}

/**
 * Get the lowest discounted price from variants.
 * Useful for ProductCard where we show the cheapest option.
 */
export function getLowestDiscountedPrice(
  variants: { price: number }[],
  productDiscounts: Discount[],
  now: Date = new Date()
): { originalPrice: number; discountedPrice: number; discount: Discount } | null {
  if (variants.length === 0) return null;

  const lowestPrice = Math.min(...variants.map((v) => v.price));
  return getDiscountedPrice(lowestPrice, productDiscounts, now);
}
