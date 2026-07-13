"use client";

import Link from "next/link";
import Image from "next/image";
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
              <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Carrito vacío</p>
              <p className="text-xs text-muted-foreground">
                Explorá la colección y encontrá algo que te guste.
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
                  {/* Image */}
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 shrink-0 object-cover bg-muted"
                    />
                  ) : (
                    <div
                      className="h-16 w-16 shrink-0 bg-muted flex items-center justify-center text-xs text-muted-foreground"
                      aria-hidden="true"
                    >
                      {item.name.charAt(0)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {item.variantName}
                      </p>
                      {"stock" in item && item.stock === 0 && (
                        <p className="text-xs text-destructive font-medium mt-1">
                          Sin stock
                        </p>
                      )}
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
