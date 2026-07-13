"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { discountSchema, type DiscountInput } from "../lib/schemas";
import {
  createDiscount,
  updateDiscount,
} from "../lib/discount-actions";
import { Button } from "@/components/ui/button";
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
          <label htmlFor="productId" className="block text-sm font-medium mb-1">
            Producto (opcional)
          </label>
          <input
            id="productId"
            type="text"
            {...register("productId")}
            placeholder="ID del producto"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Categoria (opcional)
          </label>
          <input
            id="categoryId"
            type="text"
            {...register("categoryId")}
            placeholder="ID de la categoria"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

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
          {initialData ? "Guardar cambios" : "Crear descuento"}
        </Button>
      </div>
    </form>
  );
}
