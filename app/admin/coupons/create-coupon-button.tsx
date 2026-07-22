"use client";

import { useState } from "react";
import { CouponForm } from "@/features/admin/ui/coupon-form";
import { useRouter } from "next/navigation";

export function CreateCouponButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Agregar cupon</h2>
          <CouponForm
            onSuccess={() => {
              setIsOpen(false);
              router.refresh();
            }}
          />
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
    >
      + Agregar cupon
    </button>
  );
}
