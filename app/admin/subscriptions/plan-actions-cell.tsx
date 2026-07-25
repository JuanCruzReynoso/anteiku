"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteSubscriptionPlan,
  toggleSubscriptionPlanActive,
  getPlanSubscriberCount,
} from "@/features/admin/lib/subscription-actions";
import { SubscriptionPlanForm } from "@/features/admin/ui/subscription-form";
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
import type { SubscriptionPlan } from "./subscriptions-list";

interface PlanActionsProps {
  plan: SubscriptionPlan;
}

export function PlanActions({ plan }: PlanActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showZeroDeleteConfirm, setShowZeroDeleteConfirm] = useState(false);
  const [pendingToggle, setPendingToggle] = useState(false);

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Editar plan</h2>
          <SubscriptionPlanForm
            initialData={plan}
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
    const result = await toggleSubscriptionPlanActive(plan.id);
    if (result.success) {
      toast.success(result.active ? "Plan activado" : "Plan desactivado");
      router.refresh();
    } else {
      toast.error(result.error ?? "Error al cambiar estado del plan");
    }
    setShowToggleConfirm(false);
    setPendingToggle(false);
  };

  const handleToggleClick = async () => {
    if (plan.active) {
      // Deactivating — check subscriber count
      const { count } = await getPlanSubscriberCount(plan.id);
      setSubscriberCount(count);
      if (count > 0) {
        setPendingToggle(true);
        setShowToggleConfirm(true);
        return;
      }
    }
    // Activating or no subscribers — toggle immediately
    await handleToggle();
  };

  const handleDeleteClick = async () => {
    const { count } = await getPlanSubscriberCount(plan.id);
    setSubscriberCount(count);
    if (count > 0) {
      setShowDeleteConfirm(true);
    } else {
      setShowZeroDeleteConfirm(true);
    }
  };

  const performDelete = async () => {
    try {
      await deleteSubscriptionPlan(plan.id);
      toast.success("Plan eliminado");
      router.refresh();
    } catch {
      toast.error("Error al eliminar el plan");
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex gap-2 justify-end items-center">
      {/* Toggle active/inactive */}
      <button
        onClick={handleToggleClick}
        className={`text-xs px-2 py-1 rounded ${
          plan.active
            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
        }`}
      >
        {plan.active ? "Activo" : "Inactivo"}
      </button>

      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Editar
      </button>
      <button
        onClick={handleDeleteClick}
        className="text-sm text-destructive hover:text-destructive/80"
      >
        Eliminar
      </button>

      {/* Toggle confirmation dialog */}
      <AlertDialog open={showToggleConfirm} onOpenChange={setShowToggleConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desactivar plan</AlertDialogTitle>
            <AlertDialogDescription>
              Este plan tiene {subscriberCount} suscriptor
              {subscriberCount !== 1 ? "es" : ""} activo
              {subscriberCount !== 1 ? "s" : ""}. Desactivarlo no afecta
              suscripciones existentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingToggle(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle}>
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog with subscriber warning */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar plan</AlertDialogTitle>
            <AlertDialogDescription>
              Este plan tiene {subscriberCount} suscriptor
              {subscriberCount !== 1 ? "es" : ""} activo
              {subscriberCount !== 1 ? "s" : ""}. Eliminarlo cancelará todas las
              suscripciones asociadas. ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={performDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog for zero subscribers */}
      <AlertDialog open={showZeroDeleteConfirm} onOpenChange={setShowZeroDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar plan</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que querés eliminar este plan? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={performDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
