"use server";

import { validateCoupon } from "@/features/admin/lib/coupon-actions";

export interface CouponResult {
  valid: boolean;
  error?: string;
  discount?: {
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    code: string;
  };
}

export async function validateCheckoutCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: "Ingresá un código de cupón" };
  }

  const result = await validateCoupon(code.trim(), subtotal);

  if (!result.valid) {
    return { valid: false, error: result.error };
  }

  return {
    valid: true,
    discount: {
      type: result.coupon!.type as "percentage" | "fixed" | "free_shipping",
      value: result.coupon!.value,
      code: result.coupon!.code,
    },
  };
}
