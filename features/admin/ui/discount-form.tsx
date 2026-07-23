"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { discountSchema, type DiscountInput } from "../lib/schemas";
import {
  createDiscount,
  updateDiscount,
} from "../lib/discount-actions";
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

interface DiscountFormProps {
  initialData?: {
    id: string;
    name: string;
    type: string;
    value: number;
    productId?: string | null;
    categoryId?: string | null;
    minPurchase?: number | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
    active?: boolean | null;
  };
  onSuccess?: () => void;
}

export function DiscountForm({ initialData, onSuccess }: DiscountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      type: (initialData?.type as "percentage" | "fixed") ?? "percentage",
      value: initialData?.value ?? 0,
      productId: initialData?.productId ?? "",
      categoryId: initialData?.categoryId ?? "",
      minPurchase: initialData?.minPurchase ?? undefined,
      startsAt: initialData?.startsAt ?? undefined,
      endsAt: initialData?.endsAt ?? undefined,
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = async (data: DiscountInput) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        productId: data.productId || undefined,
        categoryId: data.categoryId || undefined,
      };
      if (initialData) {
        await updateDiscount(initialData.id, payload);
        toast.success("Descuento actualizado");
      } else {
        await createDiscount(payload);
        toast.success("Descuento creado");
      }
      onSuccess?.();
    } catch {
      toast.error("Error al guardar el descuento");
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
          placeholder="Ej: Descuento de verano"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
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
          <Label htmlFor="productId" className="block text-sm font-medium mb-1">
            Producto (opcional)
          </Label>
          <Input
            id="productId"
            type="text"
            {...register("productId")}
            placeholder="ID del producto"
          />
        </div>
        <div>
          <Label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Categoria (opcional)
          </Label>
          <Input
            id="categoryId"
            type="text"
            {...register("categoryId")}
            placeholder="ID de la categoria"
          />
        </div>
      </div>

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
          {initialData ? "Guardar cambios" : "Crear descuento"}
        </Button>
      </div>
    </form>
  );
}
