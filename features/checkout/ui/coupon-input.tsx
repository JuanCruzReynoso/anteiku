"use client";

import { useState } from "react";
import { toast } from "sonner";
import { validateCheckoutCoupon } from "@/features/checkout/lib/coupon-actions";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
          <Badge variant="secondary" className="font-mono">
            {appliedCoupon.code}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {appliedCoupon.type === "percentage"
              ? `-${appliedCoupon.value}%`
              : appliedCoupon.type === "fixed"
              ? `-${formatPrice(appliedCoupon.value)}`
              : "Envío gratis"}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCouponRemoved}
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
        >
          Quitar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Cupón"
        className="h-10 flex-1 bg-muted"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleApply();
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleApply}
        disabled={isValidating || !code.trim()}
        className="h-10 px-4"
      >
        {isValidating ? "..." : "Aplicar"}
      </Button>
    </div>
  );
}
