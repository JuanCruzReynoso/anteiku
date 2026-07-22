"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCoupon } from "@/features/admin/lib/coupon-actions";
import { CouponForm } from "@/features/admin/ui/coupon-form";
import type { Coupon } from "./page";

interface CouponActionsProps {
  coupon: Coupon;
}

export function CouponActions({ coupon }: CouponActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Editar cupon</h2>
          <CouponForm
            initialData={coupon}
            onSuccess={() => {
              setIsEditing(false);
              router.refresh();
            }}
          />
          <button
            onClick={() => setIsEditing(false)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Estas seguro que queres eliminar este cupon?")) {
      return;
    }
    try {
      await deleteCoupon(coupon.id);
      toast.success("Cupon eliminado");
      router.refresh();
    } catch {
      toast.error("Error al eliminar el cupon");
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Editar
      </button>
      <button
        onClick={handleDelete}
        className="text-sm text-destructive hover:text-destructive/80"
      >
        Eliminar
      </button>
    </div>
  );
}
