"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponInput } from "../lib/schemas";
import {
  createCoupon,
  updateCoupon,
  generateCouponCode,
  bulkCreateCoupons,
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
    maxUsesPerUser?: number | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
    active?: boolean | null;
  };
  onSuccess?: () => void;
}

export function CouponForm({ initialData, onSuccess }: CouponFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
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
      maxUsesPerUser: initialData?.maxUsesPerUser ?? 1,
      startsAt: initialData?.startsAt ?? undefined,
      endsAt: initialData?.endsAt ?? undefined,
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = async (data: CouponInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await updateCoupon(initialData.id, data);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success("Cupon actualizado");
      } else {
        const result = await createCoupon(data);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success("Cupon creado");
      }
      onSuccess?.();
    } catch {
      toast.error("Error al guardar el cupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const { code } = await generateCouponCode();
      setValue("code", code, { shouldValidate: true });
    } catch {
      toast.error("Error al generar código");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code" className="block text-sm font-medium mb-1">
            Codigo
          </Label>
          <div className="flex gap-2">
            <Input
              id="code"
              type="text"
              {...register("code")}
              placeholder="Ej: VERANO2024"
              className="uppercase flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleGenerateCode}
              disabled={generating}
              title="Generar código"
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="text-lg leading-none">✦</span>
              )}
            </Button>
          </div>
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="minPurchase" className="block text-sm font-medium mb-1">
            Compra minima (ARS)
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
            Maximo de usos
          </Label>
          <Input
            id="maxUses"
            type="number"
            {...register("maxUses", { valueAsNumber: true })}
            min={0}
            placeholder="Sin limite"
          />
        </div>
        <div>
          <Label htmlFor="maxUsesPerUser" className="block text-sm font-medium mb-1">
            Usos max / usuario
          </Label>
          <Input
            id="maxUsesPerUser"
            type="number"
            {...register("maxUsesPerUser", { valueAsNumber: true })}
            min={1}
            defaultValue={1}
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
        {!initialData && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowBulk(!showBulk)}
          >
            Generar en lote
          </Button>
        )}
      </div>

      {showBulk && <BulkCouponModal onClose={() => setShowBulk(false)} />}
    </form>
  );
}

function BulkCouponModal({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > 100) {
      toast.error("No se pueden generar más de 100 cupones");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await bulkCreateCoupons({
        prefix: prefix || undefined,
        quantity,
        type,
        value,
      });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`${result.coupons.length} cupones creados`);
        onClose();
      }
    } catch {
      toast.error("Error al generar cupones");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
      <h3 className="text-sm font-semibold">Generación masiva</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Prefijo (opcional)</Label>
            <Input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Ej: VERANO"
              className="uppercase"
              maxLength={10}
            />
          </div>
          <div>
            <Label className="text-xs">Cantidad</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              max={100}
            />
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="percentage">Porcentaje</option>
              <option value="fixed">Monto fijo</option>
              <option value="free_shipping">Envio gratis</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Valor</Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={0}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
              Generar {quantity} cupones
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
