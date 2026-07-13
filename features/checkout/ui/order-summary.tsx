"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/features/cart/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { CouponInput } from "./coupon-input";

interface CouponDiscount {
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  code: string;
}

export function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDiscount | null>(
    null
  );

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discountAmount = Math.round(total * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === "fixed") {
      discountAmount = Math.min(appliedCoupon.value, total);
    }
  }

  const subtotalAfterDiscount = total - discountAmount;

  // Shipping calculation (free if coupon is free_shipping or subtotal >= 50000)
  const freeShipping =
    appliedCoupon?.type === "free_shipping" || subtotalAfterDiscount >= 50000;
  const shipping = freeShipping ? 0 : 2500;

  const grandTotal = subtotalAfterDiscount + shipping;

  return (
    <div className="space-y-6">
      <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
        Resumen del pedido
      </h2>

      {/* Items — borderless */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 object-cover bg-muted"
              />
            ) : (
              <div className="h-14 w-14 shrink-0 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                {item.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.variantName}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                Cant: {item.quantity}
              </p>
            </div>
            <p className="text-sm font-medium shrink-0 tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Coupon Input */}
      <div className="pt-4">
        <CouponInput
          subtotal={total}
          onCouponApplied={setAppliedCoupon}
          onCouponRemoved={() => setAppliedCoupon(null)}
          appliedCoupon={appliedCoupon}
        />
      </div>

      {/* Totals — clean separation */}
      <div className="pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-destructive">
            <span>Descuento ({appliedCoupon?.code})</span>
            <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="tabular-nums">
            {shipping === 0 ? "Gratis" : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-muted-foreground">
            Envío gratis en compras mayores a {formatPrice(50000)}
          </p>
        )}
        <div className="flex justify-between text-lg font-semibold pt-3">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
