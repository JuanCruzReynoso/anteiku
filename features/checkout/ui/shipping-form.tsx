"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { shippingSchema, type ShippingFormData } from "../lib/schema";
import { getActiveShippingMethods, type ShippingMethod } from "../lib/shipping-actions";
import { getSavedAddresses } from "@/features/account/lib/actions";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SavedAddress {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData & { shippingMethodId: string }) => void;
  defaultValues?: Partial<ShippingFormData>;
}

export function ShippingForm({ onSubmit, defaultValues }: ShippingFormProps) {
  const { data: session } = useSession();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  useEffect(() => {
    if (!session?.user?.id) return;

    async function loadAddresses() {
      try {
        const addresses = await getSavedAddresses();
        setSavedAddresses(addresses);
        // Auto-select default address
        const defaultAddr = addresses.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          reset({
            email: defaultValues?.email || "",
            name: defaultAddr.name,
            phone: defaultAddr.phone || defaultValues?.phone || "",
            line1: defaultAddr.line1,
            line2: defaultAddr.line2 || "",
            city: defaultAddr.city,
            state: defaultAddr.state,
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country || "Argentina",
          });
        }
      } catch {
        // Silently fail — user can still enter address manually
      }
    }
    loadAddresses();
  }, [session?.user?.id, reset, defaultValues]);

  function handleAddressSelect(addressId: string) {
    setSelectedAddressId(addressId);
    if (addressId === "new") {
      reset({
        email: defaultValues?.email || "",
        name: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Argentina",
      });
      return;
    }
    const addr = savedAddresses.find((a) => a.id === addressId);
    if (addr) {
      reset({
        email: defaultValues?.email || "",
        name: addr.name,
        phone: addr.phone || "",
        line1: addr.line1,
        line2: addr.line2 || "",
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country || "Argentina",
      });
    }
  }

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

      {/* Saved Address Selector */}
      {session?.user?.id && savedAddresses.length > 0 && (
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Dirección guardada
          </Label>
          <RadioGroup
            value={selectedAddressId}
            onValueChange={handleAddressSelect}
            className="space-y-2"
          >
            <Label
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                selectedAddressId === "new"
                  ? "bg-muted ring-1 ring-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <RadioGroupItem value="new" />
              <span className="text-sm">Usar nueva dirección</span>
            </Label>
            {savedAddresses.map((addr) => (
              <Label
                key={addr.id}
                className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                  selectedAddressId === addr.id
                    ? "bg-muted ring-1 ring-foreground"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <RadioGroupItem value={addr.id} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{addr.name}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] uppercase tracking-wider bg-foreground text-background px-1.5 py-0.5">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {addr.line1}{addr.line2 && `, ${addr.line2}`} — {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="h-12 bg-muted px-4"
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Nombre completo
        </Label>
        <Input
          id="name"
          type="text"
          {...register("name")}
          required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="h-12 bg-muted px-4"
          placeholder="Juan Pérez"
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Teléfono
        </Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          required
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className="h-12 bg-muted px-4"
          placeholder="+54 11 1234-5678"
        />
        {errors.phone && (
          <p id="phone-error" className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="line1" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Dirección
        </Label>
        <Input
          id="line1"
          type="text"
          {...register("line1")}
          required
          aria-invalid={!!errors.line1}
          aria-describedby={errors.line1 ? "line1-error" : undefined}
          className="h-12 bg-muted px-4"
          placeholder="Av. Corrientes 1234"
        />
        {errors.line1 && (
          <p id="line1-error" className="text-xs text-destructive">{errors.line1.message}</p>
        )}
      </div>

      {/* Address line 2 */}
      <div className="space-y-2">
        <Label htmlFor="line2" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Piso, departamento, etc. <span className="normal-case tracking-normal">(opcional)</span>
        </Label>
        <Input
          id="line2"
          type="text"
          {...register("line2")}
          className="h-12 bg-muted px-4"
          placeholder="Piso 4, Depto B"
        />
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Ciudad
          </Label>
          <Input
            id="city"
            type="text"
            {...register("city")}
            required
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "city-error" : undefined}
            className="h-12 bg-muted px-4"
            placeholder="Buenos Aires"
          />
          {errors.city && (
            <p id="city-error" className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Provincia
          </Label>
          <Input
            id="state"
            type="text"
            {...register("state")}
            required
            aria-invalid={!!errors.state}
            aria-describedby={errors.state ? "state-error" : undefined}
            className="h-12 bg-muted px-4"
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
          <Label htmlFor="postalCode" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Código postal
          </Label>
          <Input
            id="postalCode"
            type="text"
            {...register("postalCode")}
            required
            aria-invalid={!!errors.postalCode}
            aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
            className="h-12 bg-muted px-4"
            placeholder="C1000"
          />
          {errors.postalCode && (
            <p id="postalCode-error" className="text-xs text-destructive">
              {errors.postalCode.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            País
          </Label>
          <Input
            id="country"
            type="text"
            {...register("country")}
            required
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? "country-error" : undefined}
            className="h-12 bg-muted px-4"
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
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <RadioGroup
            value={selectedMethod}
            onValueChange={setSelectedMethod}
            className="space-y-3"
          >
            {shippingMethods.map((method) => (
              <Label
                key={method.id}
                className={`flex items-start gap-4 p-4 cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? "bg-muted ring-1 ring-foreground"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <RadioGroupItem value={method.id} className="mt-1" />
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
              </Label>
            ))}
          </RadioGroup>
        )}
      </div>

      {/* Submit — pill button */}
      <Button
        type="submit"
        className="w-full h-12 rounded-full"
      >
        Continuar al pago
      </Button>
    </form>
  );
}
