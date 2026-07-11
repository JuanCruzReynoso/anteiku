"use client";

import { useEffect } from "react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../lib/cart-store";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount);
  const total = useCartStore((s) => s.total);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // Close on Escape + lock scroll
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Carrito de compras"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">
              Carrito ({itemCount})
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Empty state */}
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-4 py-4 border-b last:border-b-0"
                  >
                    {/* Image placeholder */}
                    <div className="h-20 w-20 shrink-0 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      img
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.variantName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="inline-flex size-7 items-center justify-center rounded border hover:bg-muted transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            className="inline-flex size-7 items-center justify-center rounded border hover:bg-muted transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price + remove */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.variantId)}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>
                <a
                  href="/checkout"
                  className="flex w-full h-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Finalizar compra
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
