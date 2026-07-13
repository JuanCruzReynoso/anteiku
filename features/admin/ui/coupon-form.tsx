"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponInput } from "../lib/schemas";
import {
  createCoupon,
  updateCoupon,
} from "../lib/coupon-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CouponFormProps {
  initialData?: {
    id: string;
    code: string;
    name: string;
    type: string;
    value: number;
    minPurchase?: number | null;
    maxUses?: number | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
    active?: boolean | null;
  };
  onSuccess?: () => void;
}

export function CouponForm({ initialData, onSuccess }: CouponFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
      type: (initialData?.type as "percentage" | "fixed" | "free_shipping") ?? "percentage",
      value: initialData?.value ?? 0,
      minPurchase: initialData?.minPurchase ?? undefined,
      maxUses: initialData?.maxUses ?? undefined,
      startsAt: initialData?.startsAt ?? undefined,
      endsAt: initialData?.endsAt ?? undefined,
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = async (data: CouponInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateCoupon(initialData.id, data);
        toast.success("Cupon actualizado");
      } else {
        await createCoupon(data);
        toast.success("Cupon creado");
      }
      onSuccess?.();
    } catch {
      toast.error("Error al guardar el cupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium mb-1">
            Codigo
          </label>
          <input
            id="code"
            type="text"
            {...register("code")}
            placeholder="Ej: VERANO2024"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring uppercase"
          />
          {errors.code && (
            <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            placeholder="Ej: Descuento de verano"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            Tipo
          </label>
          <select
            id="type"
            {...register("type")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="percentage">Porcentaje</option>
            <option value="fixed">Monto fijo</option>
            <option value="free_shipping">Envio gratis</option>
          </select>
        </div>
        <div>
          <label htmlFor="value" className="block text-sm font-medium mb-1">
            Valor
          </label>
          <input
            id="value"
            type="number"
            {...register("value", { valueAsNumber: true })}
            min={0}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.value && (
            <p className="text-sm text-destructive mt-1">{errors.value.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="minPurchase" className="block text-sm font-medium mb-1">
            Compra minima (ARS, opcional)
          </label>
          <input
            id="minPurchase"
            type="number"
            {...register("minPurchase", { valueAsNumber: true })}
            min={0}
            placeholder="0"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="maxUses" className="block text-sm font-medium mb-1">
            Maximo de usos (opcional)
          </label>
          <input
            id="maxUses"
            type="number"
            {...register("maxUses", { valueAsNumber: true })}
            min={0}
            placeholder="Sin limite"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startsAt" className="block text-sm font-medium mb-1">
            Fecha de inicio (opcional)
          </label>
          <input
            id="startsAt"
            type="date"
            {...register("startsAt", { valueAsDate: true })}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="endsAt" className="block text-sm font-medium mb-1">
            Fecha de fin (opcional)
          </label>
          <input
            id="endsAt"
            type="date"
            {...register("endsAt", { valueAsDate: true })}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
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
          {initialData ? "Guardar cambios" : "Crear cupon"}
        </Button>
      </div>
    </form>
  );
}
