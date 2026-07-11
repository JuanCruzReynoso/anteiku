"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../lib/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

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

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Carrito ({itemCount})</SheetTitle>
          <SheetDescription>Revisá tus productos antes de finalizar la compra</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <aside className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tu carrito está vacío</p>
              <p className="text-xs text-muted-foreground">
                Explorá nuestra colección y encontrá algo que te guste.
              </p>
            </div>
            <Button
              variant="outline"
              render={<Link href="/shop" onClick={onClose} />}
            >
              Ver productos
            </Button>
          </aside>
        ) : (
          <>
            {/* Items — no borders, clean separation */}
            <section aria-label="Productos en el carrito" className="flex-1 overflow-y-auto px-6">
              {items.map((item) => (
                <article
                  key={item.variantId}
                  className="flex gap-4 py-6"
                >
                  {/* Image placeholder */}
                  <div
                    className="h-16 w-16 shrink-0 bg-muted flex items-center justify-center text-xs text-muted-foreground"
                    aria-hidden="true"
                  >
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
                      {/* Quantity — pill controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          aria-label={`Disminuir cantidad de ${item.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <output className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                          {item.quantity}
                        </output>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          aria-label={`Aumentar cantidad de ${item.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price + remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={`Quitar ${item.name} del carrito`}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* Footer — no border-t */}
            <footer className="px-6 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</span>
                <output className="text-lg font-semibold tabular-nums" aria-live="polite">
                  {formatPrice(total)}
                </output>
              </div>
              <Button
                size="lg"
                variant="accent"
                className="w-full"
                render={<Link href="/checkout" onClick={onClose} />}
              >
                Finalizar compra
              </Button>
            </footer>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
