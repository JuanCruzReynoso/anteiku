export function getProductDisplayData(product: {
  variants: { price: number }[];
  images: string[];
}) {
  const minPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : 0;
  const hasVariants = product.variants.length > 1;
  const hasRealImage =
    !!product.images[0] && !product.images[0].startsWith("/placeholder");

  return { minPrice, hasVariants, hasRealImage };
}
