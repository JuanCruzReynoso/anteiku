"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { deleteShipmentMethod } from "@/features/admin/lib/shipment-actions";
import { ShipmentForm } from "@/features/admin/ui/shipment-form";
import type { ShipmentMethod } from "./shipping-list";

interface ShipmentActionsProps {
  method: ShipmentMethod;
}

export function ShipmentActions({ method }: ShipmentActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Editar método de envío</h2>
          <ShipmentForm
            initialData={method}
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
    if (!confirm("¿Estás seguro de que querés eliminar este método de envío?")) {
      return;
    }
    try {
      await deleteShipmentMethod(method.id);
      toast.success("Método de envío eliminado");
      router.refresh();
    } catch {
      toast.error("Error al eliminar el método de envío");
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
