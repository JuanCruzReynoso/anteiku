"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCartStore } from "@/features/cart/lib/cart-store";
import type { ProductVariant } from "@/features/product/lib/mock-data";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    images: string[];
  };
  variant: ProductVariant;
}

export function AddToCartButton({ product, variant }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      variantName: variant.name,
      price: variant.price,
      image: product.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={variant.stock === 0}
      className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {variant.stock === 0
        ? "Out of Stock"
        : added
          ? "Added!"
          : "Add to Cart"}
    </button>
  );
}
