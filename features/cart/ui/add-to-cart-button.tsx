"use client";

import { useState } from "react";
import { toast } from "sonner";
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
    toast.success("Agregado al carrito", {
      description: `${product.name} — ${variant.name}`,
    });
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={variant.stock === 0}
      className="w-full h-12 rounded-full bg-foreground text-background font-medium hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {variant.stock === 0
        ? "Sin stock"
        : added
          ? "¡Agregado!"
          : "Agregar al carrito"}
    </button>
  );
}
