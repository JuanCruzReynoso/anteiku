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
    <div className="space-y-4">
      {/* Variant Selector */}
      {hasVariants && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Opciones</h3>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedVariant.id === variant.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
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

      {/* Add to Cart */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={selectedVariant.stock === 0}
        className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
