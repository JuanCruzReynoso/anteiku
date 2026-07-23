"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../lib/cart-store";
import { CartDrawer } from "./cart-drawer";
import { Badge } from "@/components/ui/badge";

export function CartButton() {
  const itemCount = useCartStore((s) => s.itemCount);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex size-12 items-center justify-center rounded-full hover:bg-muted transition-colors"
        aria-label={`Carrito (${itemCount} items)`}
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge className="absolute top-0 right-0 size-5 flex items-center justify-center rounded-full p-0 text-[10px] tabular-nums">
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
