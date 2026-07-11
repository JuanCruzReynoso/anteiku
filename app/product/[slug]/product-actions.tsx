"use client";

import { useState } from "react";
import { useCartStore } from "@/features/cart/lib/cart-store";
import type { Product } from "@/features/product/lib/mock-data";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [added, setAdded] = useState(false);

  const hasVariants = product.variants.length > 1;

  function handleAdd() {
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      image: product.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Variant Selector — pill buttons */}
      {hasVariants && (
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Opciones
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
                  selectedVariant.id === variant.id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <p className="text-xl font-semibold">
        {formatPrice(selectedVariant.price)}
      </p>

      {/* Add to Cart — pill button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={selectedVariant.stock === 0}
        className="w-full h-12 rounded-full bg-foreground text-background font-medium hover:bg-foreground/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedVariant.stock === 0
          ? "Sin stock"
          : added
            ? "¡Agregado!"
            : "Agregar al carrito"}
      </button>
    </div>
  );
}
