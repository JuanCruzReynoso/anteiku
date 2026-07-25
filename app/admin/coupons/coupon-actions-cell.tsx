"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCoupon, toggleCouponActive } from "@/features/admin/lib/coupon-actions";
import { CouponForm } from "@/features/admin/ui/coupon-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Coupon } from "./coupons-list";

interface CouponActionsProps {
  coupon: Coupon;
}

export function CouponActions({ coupon }: CouponActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [toggling, setToggling] = useState(false);

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

  const handleToggle = async () => {
    setToggling(true);
    try {
      const result = await toggleCouponActive(coupon.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(result.active ? "Cupón activado" : "Cupón desactivado");
        router.refresh();
      }
    } catch {
      toast.error("Error al cambiar estado del cupón");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
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
        onClick={handleToggle}
        disabled={toggling}
        className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        {coupon.active ? "Desactivar" : "Activar"}
      </button>
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Editar
      </button>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <button className="text-sm text-destructive hover:text-destructive/80" />
          }
        >
          Eliminar
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cupón</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que querés eliminar este cupón? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
