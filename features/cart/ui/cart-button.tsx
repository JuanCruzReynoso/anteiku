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
        className="relative inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        aria-label={`Cart (${itemCount} items)`}
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
