"use client";

import { useState } from "react";
import { toast } from "sonner";
import { validateCheckoutCoupon } from "@/features/checkout/lib/coupon-actions";
import { formatPrice } from "@/lib/utils";

interface CouponInputProps {
  subtotal: number;
  onCouponApplied: (discount: {
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    code: string;
  }) => void;
  onCouponRemoved: () => void;
  appliedCoupon: {
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    code: string;
  } | null;
}

export function CouponInput({
  subtotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  async function handleApply() {
    if (!code.trim()) return;

    setIsValidating(true);
    try {
      const result = await validateCheckoutCoupon(code, subtotal);
      if (result.valid && result.discount) {
        onCouponApplied(result.discount);
        toast.success("Cupón aplicado", {
          description: result.discount.type === "percentage"
            ? `${result.discount.value}% de descuento`
            : result.discount.type === "fixed"
            ? `${formatPrice(result.discount.value)} de descuento`
            : "Envío gratis",
        });
        setCode("");
      } else {
        toast.error("Cupón inválido", {
          description: result.error,
        });
      }
    } catch {
      toast.error("Error al validar el cupón");
    } finally {
      setIsValidating(false);
    }
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between bg-muted/50 p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-foreground text-background px-2 py-1 rounded">
            {appliedCoupon.code}
          </span>
          <span className="text-sm text-muted-foreground">
            {appliedCoupon.type === "percentage"
              ? `-${appliedCoupon.value}%`
              : appliedCoupon.type === "fixed"
              ? `-${formatPrice(appliedCoupon.value)}`
              : "Envío gratis"}
          </span>
        </div>
        <button
          type="button"
          onClick={onCouponRemoved}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Quitar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Cupón"
        className="flex-1 h-10 px-3 bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleApply();
          }
        }}
      />
      <button
        type="button"
        onClick={handleApply}
        disabled={isValidating || !code.trim()}
        className="h-10 px-4 bg-muted text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isValidating ? "..." : "Aplicar"}
      </button>
    </div>
  );
}
