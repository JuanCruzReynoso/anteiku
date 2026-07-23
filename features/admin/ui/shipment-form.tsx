"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shipmentMethodSchema, type ShipmentMethodInput } from "../lib/schemas";
import {
  createShipmentMethod,
  updateShipmentMethod,
} from "../lib/shipment-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
    control,
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
        <Label htmlFor="name" className="block text-sm font-medium mb-1">
          Nombre
        </Label>
        <Input
          id="name"
          type="text"
          {...register("name")}
          placeholder="Ej: Envío estándar"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripción
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={2}
          placeholder="Opcional: describe el método de envío"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cost" className="block text-sm font-medium mb-1">
            Costo (ARS)
          </Label>
          <Input
            id="cost"
            type="number"
            {...register("cost", { valueAsNumber: true })}
            min={0}
          />
          {errors.cost && (
            <p className="text-sm text-destructive mt-1">{errors.cost.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="estimatedDays" className="block text-sm font-medium mb-1">
            Días estimados
          </Label>
          <Input
            id="estimatedDays"
            type="number"
            {...register("estimatedDays", { valueAsNumber: true })}
            min={1}
          />
          {errors.estimatedDays && (
            <p className="text-sm text-destructive mt-1">
              {errors.estimatedDays.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <Checkbox
              id="active"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="active" className="text-sm font-medium">
          Activo
        </Label>
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
