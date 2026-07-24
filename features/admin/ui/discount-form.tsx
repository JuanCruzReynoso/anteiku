"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { discountSchema, type DiscountInput } from "../lib/schemas";
import {
  createDiscount,
  updateDiscount,
  getProductsForPicker,
  getCategoriesForPicker,
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
import { Loader2, ChevronDown, X } from "lucide-react";

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

interface PickerItem {
  id: string;
  name: string;
}

function SearchablePicker({
  label,
  items,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  items: PickerItem[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((i) => i.id === value);
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Label className="block text-sm font-medium mb-1">{label}</Label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selectedItem ? "" : "text-muted-foreground"}>
          {selectedItem?.name ?? placeholder ?? "Seleccionar..."}
        </span>
        {selectedItem && !disabled ? (
          <X
            className="size-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setSearch("");
            }}
          />
        ) : (
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        )}
      </button>
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                Sin resultados
              </p>
            )}
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange(item.id);
                  setOpen(false);
                  setSearch("");
                }}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DiscountForm({ initialData, onSuccess }: DiscountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<PickerItem[]>([]);
  const [categories, setCategories] = useState<PickerItem[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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

  const productId = watch("productId");
  const categoryId = watch("categoryId");

  useEffect(() => {
    getProductsForPicker().then(setProducts);
    getCategoriesForPicker().then(setCategories);
  }, []);

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
        <Controller
          control={control}
          name="productId"
          render={({ field }) => (
            <SearchablePicker
              label="Producto (opcional)"
              items={products}
              value={field.value ?? ""}
              onChange={(val) => {
                field.onChange(val);
                if (val) setValue("categoryId", "");
              }}
              disabled={!!categoryId}
              placeholder="Seleccionar producto..."
            />
          )}
        />
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <SearchablePicker
              label="Categoría (opcional)"
              items={categories}
              value={field.value ?? ""}
              onChange={(val) => {
                field.onChange(val);
                if (val) setValue("productId", "");
              }}
              disabled={!!productId}
              placeholder="Seleccionar categoría..."
            />
          )}
        />
      </div>
      {errors.productId && (
        <p className="text-sm text-destructive">{errors.productId.message}</p>
      )}
      {errors.categoryId && (
        <p className="text-sm text-destructive">{errors.categoryId.message}</p>
      )}

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
