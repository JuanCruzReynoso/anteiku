"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/features/admin/lib/order-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/status-labels";
import { VALID_ORDER_TRANSITIONS, DESTRUCTIVE_TRANSITIONS } from "@/features/admin/lib/order-transitions";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<{ status: string; notes: string } | null>(null);

  const allowedStatuses = [currentStatus, ...(VALID_ORDER_TRANSITIONS[currentStatus] ?? [])];
  const router = useRouter();

  const handleSave = async () => {
    if (DESTRUCTIVE_TRANSITIONS.has(status) && status !== currentStatus) {
      setPendingTransition({ status, notes: notes || "" });
      setShowConfirmDialog(true);
      return;
    }
    await performUpdate(status, notes);
  };

  const performUpdate = async (newStatus: string, newNotes: string) => {
    setIsSaving(true);
    try {
      const result = await updateOrderStatus(
        orderId,
        newStatus as "pending" | "paid" | "shipped" | "delivered" | "cancelled",
        newNotes || undefined
      );
      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Orden actualizada");
        router.refresh();
      }
    } catch {
      toast.error("Error al actualizar la orden");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmTransition = async () => {
    if (!pendingTransition) return;
    setShowConfirmDialog(false);
    await performUpdate(pendingTransition.status, pendingTransition.notes);
    setPendingTransition(null);
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
            {allowedStatuses.map((value) => (
              <option key={value} value={value}>
                {ORDER_STATUS_LABELS[value] ?? value}
              </option>
            ))}
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio</AlertDialogTitle>
            <AlertDialogDescription>
              {status === "cancelled"
                ? "¿Estás seguro que querés cancelar esta orden? Esta acción no se puede deshacer."
                : "¿Confirmás que esta orden fue entregada?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTransition}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
