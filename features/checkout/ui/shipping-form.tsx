"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingSchema, type ShippingFormData } from "../lib/schema";

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
  defaultValues?: Partial<ShippingFormData>;
}

export function ShippingForm({ onSubmit, defaultValues }: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      country: "Argentina",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold">Datos de envío</h2>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre completo
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Juan Pérez"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Teléfono
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="+54 11 1234-5678"
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label htmlFor="line1" className="text-sm font-medium">
          Dirección
        </label>
        <input
          id="line1"
          type="text"
          {...register("line1")}
          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Av. Corrientes 1234"
        />
        {errors.line1 && (
          <p className="text-xs text-destructive">{errors.line1.message}</p>
        )}
      </div>

      {/* Address line 2 */}
      <div className="space-y-2">
        <label htmlFor="line2" className="text-sm font-medium">
          Piso, departamento, etc. <span className="text-muted-foreground">(opcional)</span>
        </label>
        <input
          id="line2"
          type="text"
          {...register("line2")}
          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Piso 4, Depto B"
        />
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            Ciudad
          </label>
          <input
            id="city"
            type="text"
            {...register("city")}
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Buenos Aires"
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="state" className="text-sm font-medium">
            Provincia
          </label>
          <input
            id="state"
            type="text"
            {...register("state")}
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
          <label htmlFor="postalCode" className="text-sm font-medium">
            Código postal
          </label>
          <input
            id="postalCode"
            type="text"
            {...register("postalCode")}
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="C1000"
          />
          {errors.postalCode && (
            <p className="text-xs text-destructive">
              {errors.postalCode.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-medium">
            País
          </label>
          <input
            id="country"
            type="text"
            {...register("country")}
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {errors.country && (
            <p className="text-xs text-destructive">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Continuar al pago
      </button>
    </form>
  );
}
