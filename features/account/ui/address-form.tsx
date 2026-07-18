"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  createAddress,
  updateAddress,
  type AddressInput,
} from "@/features/account/lib/actions";

const addressFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  street: z.string().min(1, "La calle es obligatoria"),
  streetNumber: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().min(1, "La ciudad es obligatoria"),
  state: z.string().min(1, "La provincia es obligatoria"),
  postalCode: z.string().min(1, "El código postal es obligatorio"),
  country: z.string().min(1, "El país es obligatorio"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  initialData?: AddressInput & { id?: string };
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ initialData, onSuccess, onCancel }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      street: initialData?.street || "",
      streetNumber: initialData?.streetNumber || "",
      apartment: initialData?.apartment || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      country: initialData?.country || "Argentina",
      phone: initialData?.phone || "",
      isDefault: initialData?.isDefault || false,
    },
  });

  async function onSubmit(data: AddressFormData) {
    setIsSubmitting(true);
    try {
      const payload: AddressInput = {
        ...data,
        country: data.country || "Argentina",
        streetNumber: data.streetNumber || undefined,
        apartment: data.apartment || undefined,
        phone: data.phone || undefined,
        isDefault: data.isDefault || false,
      };

      const result = isEditing
        ? await updateAddress(initialData!.id!, payload)
        : await createAddress(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Dirección actualizada" : "Dirección creada");
        onSuccess();
      }
    } catch {
      toast.error("Error al guardar la dirección");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-lg font-medium">
        {isEditing ? "Editar dirección" : "Nueva dirección"}
      </h3>

      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="addr-name" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Nombre
        </label>
        <input
          id="addr-name"
          type="text"
          {...register("name")}
          className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          placeholder="Casa, Trabajo, etc."
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Street + Number */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <label htmlFor="addr-street" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Calle
          </label>
          <input
            id="addr-street"
            type="text"
            {...register("street")}
            className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
            placeholder="Av. Corrientes"
          />
          {errors.street && (
            <p className="text-xs text-destructive">{errors.street.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="addr-streetNumber" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Número
          </label>
          <input
            id="addr-streetNumber"
            type="text"
            {...register("streetNumber")}
            className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
            placeholder="1234"
          />
        </div>
      </div>

      {/* Apartment */}
      <div className="space-y-2">
        <label htmlFor="addr-apartment" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Piso / Departamento <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <input
          id="addr-apartment"
          type="text"
          {...register("apartment")}
          className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          placeholder="Piso 4, Depto B"
        />
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="addr-city" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Ciudad
          </label>
          <input
            id="addr-city"
            type="text"
            {...register("city")}
            className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
            placeholder="Buenos Aires"
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="addr-state" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Provincia
          </label>
          <input
            id="addr-state"
            type="text"
            {...register("state")}
            className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
            placeholder="CABA"
          />
          {errors.state && (
            <p className="text-xs text-destructive">{errors.state.message}</p>
          )}
        </div>
      </div>

      {/* Postal Code + Country */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="addr-postalCode" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Código postal
          </label>
          <input
            id="addr-postalCode"
            type="text"
            {...register("postalCode")}
            className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
            placeholder="C1000"
          />
          {errors.postalCode && (
            <p className="text-xs text-destructive">{errors.postalCode.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="addr-country" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            País
          </label>
          <input
            id="addr-country"
            type="text"
            {...register("country")}
            className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          />
          {errors.country && (
            <p className="text-xs text-destructive">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="addr-phone" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Teléfono <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <input
          id="addr-phone"
          type="tel"
          {...register("phone")}
          className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          placeholder="+54 11 1234-5678"
        />
      </div>

      {/* Default checkbox */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register("isDefault")}
          className="size-4 rounded border-border accent-foreground"
        />
        <span className="text-sm">Establecer como dirección predeterminada</span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear dirección"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
