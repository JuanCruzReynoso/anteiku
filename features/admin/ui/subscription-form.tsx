"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionPlanSchema, type SubscriptionPlanInput } from "../lib/schemas";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from "../lib/subscription-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

interface SubscriptionPlanFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    interval: string;
    features?: string[] | null;
    active?: boolean | null;
  };
  onSuccess?: () => void;
}

export function SubscriptionPlanForm({ initialData, onSuccess }: SubscriptionPlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [features, setFeatures] = useState<string[]>(initialData?.features ?? []);
  const [newFeature, setNewFeature] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      price: initialData?.price ?? 0,
      interval: (initialData?.interval as "monthly" | "quarterly" | "yearly") ?? "monthly",
      active: initialData?.active ?? true,
    },
  });

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SubscriptionPlanInput) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, features };
      if (initialData) {
        await updateSubscriptionPlan(initialData.id, payload);
        toast.success("Plan actualizado");
      } else {
        await createSubscriptionPlan(payload);
        toast.success("Plan creado");
      }
      onSuccess?.();
    } catch {
      toast.error("Error al guardar el plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            placeholder="Ej: Cafe Mensual"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            {...register("slug")}
            placeholder="cafe-mensual"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.slug && (
            <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripcion
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={2}
          placeholder="Descripcion del plan"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Precio mensual (ARS)
          </label>
          <input
            id="price"
            type="number"
            {...register("price", { valueAsNumber: true })}
            min={0}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="interval" className="block text-sm font-medium mb-1">
            Intervalo
          </label>
          <select
            id="interval"
            {...register("interval")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium mb-2">Features</label>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 text-sm px-3 py-1.5 bg-muted rounded-lg">
                {feature}
              </span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
              placeholder="Agregar feature"
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              <Plus className="size-4" />
            </Button>
          </div>
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
          {initialData ? "Guardar cambios" : "Crear plan"}
        </Button>
      </div>
    </form>
  );
}
