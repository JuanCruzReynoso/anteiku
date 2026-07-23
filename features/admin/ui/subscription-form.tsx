"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionPlanSchema, type SubscriptionPlanInput } from "../lib/schemas";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from "../lib/subscription-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    control,
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
          <Label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre
          </Label>
          <Input
            id="name"
            type="text"
            {...register("name")}
            placeholder="Ej: Cafe Mensual"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="slug" className="block text-sm font-medium mb-1">
            Slug
          </Label>
          <Input
            id="slug"
            type="text"
            {...register("slug")}
            placeholder="cafe-mensual"
          />
          {errors.slug && (
            <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripcion
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={2}
          placeholder="Descripcion del plan"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="block text-sm font-medium mb-1">
            Precio mensual (ARS)
          </Label>
          <Input
            id="price"
            type="number"
            {...register("price", { valueAsNumber: true })}
            min={0}
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="interval" className="block text-sm font-medium mb-1">
            Intervalo
          </Label>
          <Controller
            control={control}
            name="interval"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <Label className="block text-sm font-medium mb-2">Features</Label>
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
            <Input
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
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              <Plus className="size-4" />
            </Button>
          </div>
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
          {initialData ? "Guardar cambios" : "Crear plan"}
        </Button>
      </div>
    </form>
  );
}
