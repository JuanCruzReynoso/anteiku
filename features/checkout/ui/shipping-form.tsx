"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { shippingSchema, type ShippingFormData } from "../lib/schema";
import { getActiveShippingMethods, type ShippingMethod } from "../lib/shipping-actions";
import { formatPrice } from "@/lib/utils";

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData & { shippingMethodId: string }) => void;
  defaultValues?: Partial<ShippingFormData>;
}

export function ShippingForm({ onSubmit, defaultValues }: ShippingFormProps) {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

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

  useEffect(() => {
    async function loadMethods() {
      try {
        const methods = await getActiveShippingMethods();
        setShippingMethods(methods);
        if (methods.length > 0) {
          setSelectedMethod(methods[0].id);
        }
      } catch {
        toast.error("Error al cargar métodos de envío");
      } finally {
        setIsLoadingMethods(false);
      }
    }
    loadMethods();
  }, []);

  function handleFormError() {
    const errorMessages = Object.values(errors)
      .map((e) => e?.message)
      .filter(Boolean);
    if (errorMessages.length > 0) {
      toast.error("Revisá los campos", {
        description: errorMessages[0]?.toString() || "Completá todos los campos obligatorios.",
      });
    }
  }

  function handleFormSubmit(data: ShippingFormData) {
    if (!selectedMethod) {
      toast.error("Elegí un método de envío");
      return;
    }
    onSubmit({ ...data, shippingMethodId: selectedMethod });
  }

  const selectedMethodData = shippingMethods.find((m) => m.id === selectedMethod);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="space-y-8">
      <h2 className="text-xl font-semibold">Datos de envío</h2>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="w-full h-12 bg-muted px-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Nombre completo
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="w-full h-12 bg-muted px-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          placeholder="Juan Pérez"
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="phone" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Teléfono
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          required
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className="w-full h-12 bg-muted px-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          placeholder="+54 11 1234-5678"
        />
        {errors.phone && (
          <p id="phone-error" className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label htmlFor="line1" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Dirección
        </label>
        <input
          id="line1"
          type="text"
          {...register("line1")}
          required
          aria-invalid={!!errors.line1}
          aria-describedby={errors.line1 ? "line1-error" : undefined}
          className="w-full h-12 bg-muted px-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          placeholder="Av. Corrientes 1234"
        />
        {errors.line1 && (
          <p id="line1-error" className="text-xs text-destructive">{errors.line1.message}</p>
        )}
      </div>

      {/* Address line 2 */}
      <div className="space-y-2">
        <label htmlFor="line2" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Piso, departamento, etc. <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <input
          id="line2"
          type="text"
          {...register("line2")}
          className="w-full h-12 bg-muted px-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          placeholder="Piso 4, Depto B"
        />
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="city" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Ciudad
          </label>
          <input
            id="city"
            type="text"
            {...register("city")}
            required
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "city-error" : undefined}
            className="w-full h-12 bg-muted px-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
            placeholder="Buenos Aires"
          />
          {errors.city && (
            <p id="city-error" className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="state" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Provincia
          </label>
          <input
            id="state"
            type="text"
            {...register("state")}
            required
            aria-invalid={!!errors.state}
            aria-describedby={errors.state ? "state-error" : undefined}
            className="w-full h-12 bg-muted px-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
            placeholder="CABA"
          />
          {errors.state && (
            <p id="state-error" className="text-xs text-destructive">{errors.state.message}</p>
          )}
        </div>
      </div>

      {/* Postal Code + Country */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="postalCode" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Código postal
          </label>
          <input
            id="postalCode"
            type="text"
            {...register("postalCode")}
            required
            aria-invalid={!!errors.postalCode}
            aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
            className="w-full h-12 bg-muted px-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
            placeholder="C1000"
          />
          {errors.postalCode && (
            <p id="postalCode-error" className="text-xs text-destructive">
              {errors.postalCode.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="country" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            País
          </label>
          <input
            id="country"
            type="text"
            {...register("country")}
            required
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? "country-error" : undefined}
            className="w-full h-12 bg-muted px-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          />
          {errors.country && (
            <p id="country-error" className="text-xs text-destructive">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>

      {/* Shipping Method Selector */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Método de envío
        </h3>
        {isLoadingMethods ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {shippingMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-start gap-4 p-4 cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? "bg-muted ring-1 ring-foreground"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{method.name}</p>
                    <p className="font-medium">
                      {method.cost === 0 ? "Gratis" : formatPrice(method.cost)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  {method.estimatedDays > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.estimatedDays} días hábiles
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Submit — pill button */}
      <button
        type="submit"
        className="w-full h-12 rounded-full bg-foreground text-background font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        Continuar al pago
      </button>
    </form>
  );
}
