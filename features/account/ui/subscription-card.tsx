"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
} from "@/features/account/lib/subscription-actions";
import type { UserSubscription } from "@/features/account/lib/subscription-actions";

interface SubscriptionCardProps {
  subscription: UserSubscription;
  onStatusChange: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  paused: "Pausada",
  cancelled: "Cancelada",
  past_due: "Pago pendiente",
};

export function SubscriptionCard({
  subscription,
  onStatusChange,
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCancel() {
    setIsLoading(true);
    try {
      const result = await cancelSubscription(subscription.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Suscripción cancelada");
        onStatusChange();
      }
    } catch {
      toast.error("Error al cancelar");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePause() {
    setIsLoading(true);
    try {
      const result = await pauseSubscription(subscription.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Suscripción pausada");
        onStatusChange();
      }
    } catch {
      toast.error("Error al pausar");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResume() {
    setIsLoading(true);
    try {
      const result = await resumeSubscription(subscription.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Suscripción reanudada");
        onStatusChange();
      }
    } catch {
      toast.error("Error al reanudar");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-muted p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{subscription.planName}</p>
          <p className="text-sm text-muted-foreground">
            {formatPrice(subscription.planPrice)}/
            {subscription.planInterval === "monthly" ? "mes" : "ano"}
          </p>
        </div>
        <Badge variant="secondary">
          {STATUS_LABELS[subscription.status] || subscription.status}
        </Badge>
      </div>

      {subscription.status === "active" && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            Periodo actual:{" "}
            {subscription.currentPeriodStart
              ? new Date(subscription.currentPeriodStart).toLocaleDateString("es-AR")
              : "—"}{" "}
            —{" "}
            {subscription.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd).toLocaleDateString("es-AR")
              : "—"}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {subscription.status === "active" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            disabled={isLoading}
          >
            Pausar
          </Button>
        )}
        {subscription.status === "paused" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResume}
            disabled={isLoading}
          >
            Reanudar
          </Button>
        )}
        {subscription.status !== "cancelled" && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                />
              }
            >
              Cancelar
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar suscripción</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Seguro que querés cancelar esta suscripción? Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, mantener</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  Sí, cancelar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
