"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shipmentMethodSchema, type ShipmentMethodInput } from "../lib/schemas";
import {
  createShipmentMethod,
  updateShipmentMethod,
} from "../lib/shipment-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ShipmentFormProps {
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    cost: number;
    estimatedDays: number;
    active?: boolean | null;
  };
  onSuccess?: () => void;
}

export function ShipmentForm({ initialData, onSuccess }: ShipmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shipmentMethodSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      cost: initialData?.cost ?? 0,
      estimatedDays: initialData?.estimatedDays ?? 1,
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = async (data: ShipmentMethodInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateShipmentMethod(initialData.id, data);
        toast.success("Método de envío actualizado");
      } else {
        await createShipmentMethod(data);
        toast.success("Método de envío creado");
      }
      onSuccess?.();
    } catch {
      toast.error("Error al guardar el método de envío");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          placeholder="Ej: Envío estándar"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={2}
          placeholder="Opcional: describe el método de envío"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cost" className="block text-sm font-medium mb-1">
            Costo (ARS)
          </label>
          <input
            id="cost"
            type="number"
            {...register("cost", { valueAsNumber: true })}
            min={0}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.cost && (
            <p className="text-sm text-destructive mt-1">{errors.cost.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="estimatedDays" className="block text-sm font-medium mb-1">
            Días estimados
          </label>
          <input
            id="estimatedDays"
            type="number"
            {...register("estimatedDays", { valueAsNumber: true })}
            min={1}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.estimatedDays && (
            <p className="text-sm text-destructive mt-1">
              {errors.estimatedDays.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          {...register("active")}
          className="rounded border-input"
        />
        <label htmlFor="active" className="text-sm font-medium">
          Activo
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
          {initialData ? "Guardar cambios" : "Crear método de envío"}
        </Button>
      </div>
    </form>
  );
}
