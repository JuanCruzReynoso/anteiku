"use client";

import { useCartStore } from "@/features/cart/lib/cart-store";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);

  const shipping = total >= 5000 ? 0 : 1500; // Envío gratis superando $50
  const grandTotal = total + shipping;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Resumen del pedido</h2>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            <div className="h-16 w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
              img
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.variantName}</p>
              <p className="text-xs text-muted-foreground">
                Cant: {item.quantity}
              </p>
            </div>
            <p className="text-sm font-medium shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-muted-foreground">
            Envío gratis en compras mayores a {formatPrice(5000)}
          </p>
        )}
        <div className="flex justify-between text-lg font-semibold pt-2 border-t">
          <span>Total</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
