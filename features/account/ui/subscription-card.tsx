"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
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
    if (!confirm("Seguro que querés cancelar esta suscripción?")) return;
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
        <span className="text-xs font-medium bg-foreground text-background px-3 py-1">
          {STATUS_LABELS[subscription.status] || subscription.status}
        </span>
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
          <button
            type="button"
            onClick={handlePause}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium bg-background hover:bg-muted transition-colors disabled:opacity-50"
          >
            Pausar
          </button>
        )}
        {subscription.status === "paused" && (
          <button
            type="button"
            onClick={handleResume}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium bg-background hover:bg-muted transition-colors disabled:opacity-50"
          >
            Reanudar
          </button>
        )}
        {subscription.status !== "cancelled" && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
