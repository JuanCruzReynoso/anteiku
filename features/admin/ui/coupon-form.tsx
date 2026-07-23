"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponInput } from "../lib/schemas";
import {
  createCoupon,
  updateCoupon,
} from "../lib/coupon-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    control,
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
          <Label htmlFor="code" className="block text-sm font-medium mb-1">
            Codigo
          </Label>
          <Input
            id="code"
            type="text"
            {...register("code")}
            placeholder="Ej: VERANO2024"
            className="uppercase"
          />
          {errors.code && (
            <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre
          </Label>
          <Input
            id="name"
            type="text"
            {...register("name")}
            placeholder="Ej: Descuento de verano"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type" className="block text-sm font-medium mb-1">
            Tipo
          </Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                  <SelectItem value="fixed">Monto fijo</SelectItem>
                  <SelectItem value="free_shipping">Envio gratis</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="value" className="block text-sm font-medium mb-1">
            Valor
          </Label>
          <Input
            id="value"
            type="number"
            {...register("value", { valueAsNumber: true })}
            min={0}
          />
          {errors.value && (
            <p className="text-sm text-destructive mt-1">{errors.value.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minPurchase" className="block text-sm font-medium mb-1">
            Compra minima (ARS, opcional)
          </Label>
          <Input
            id="minPurchase"
            type="number"
            {...register("minPurchase", { valueAsNumber: true })}
            min={0}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="maxUses" className="block text-sm font-medium mb-1">
            Maximo de usos (opcional)
          </Label>
          <Input
            id="maxUses"
            type="number"
            {...register("maxUses", { valueAsNumber: true })}
            min={0}
            placeholder="Sin limite"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startsAt" className="block text-sm font-medium mb-1">
            Fecha de inicio (opcional)
          </Label>
          <Input
            id="startsAt"
            type="date"
            {...register("startsAt", { valueAsDate: true })}
          />
        </div>
        <div>
          <Label htmlFor="endsAt" className="block text-sm font-medium mb-1">
            Fecha de fin (opcional)
          </Label>
          <Input
            id="endsAt"
            type="date"
            {...register("endsAt", { valueAsDate: true })}
          />
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
          {initialData ? "Guardar cambios" : "Crear cupon"}
        </Button>
      </div>
    </form>
  );
}
