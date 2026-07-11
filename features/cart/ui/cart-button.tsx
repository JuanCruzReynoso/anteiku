"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../lib/cart-store";
import { CartDrawer } from "./cart-drawer";

export function CartButton() {
  const itemCount = useCartStore((s) => s.itemCount);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex size-14 items-center justify-center rounded-full hover:bg-muted transition-colors"
        aria-label={`Cart (${itemCount} items)`}
      >
        <ShoppingBag className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute top-0 right-0 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground tabular-nums">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
