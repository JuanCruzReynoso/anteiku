"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/features/admin/lib/order-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
  currentNotes: string;
}

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentNotes,
}: OrderStatusFormProps) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOrderStatus(
        orderId,
        status as "pending" | "paid" | "shipped" | "delivered" | "cancelled",
        notes || undefined
      );
      toast.success("Orden actualizada");
    } catch {
      toast.error("Error al actualizar la orden");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        Actualizar estado
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Estado
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notas internas
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notas para uso interno del admin..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="size-4 animate-spin mr-2" />}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
