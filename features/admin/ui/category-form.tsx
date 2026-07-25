"use client";

import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "../lib/schemas";
import { createCategory, updateCategory } from "../lib/category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    active?: boolean;
    sortOrder?: number;
  };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      image: initialData?.image ?? "",
      active: initialData?.active ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  const name = useWatch({ control, name: "name" });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value);
    if (!initialData) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  };

  const onSubmit = async (data: CategoryInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateCategory(initialData.id, data);
        toast.success("Categoría actualizada");
      } else {
        await createCategory(data);
        toast.success("Categoría creada");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar la categoría"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div>
        <Label htmlFor="name" className="block text-sm font-medium mb-1">
          Nombre
        </Label>
        <Input
          id="name"
          type="text"
          {...register("name")}
          onChange={handleNameChange}
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
        />
        {errors.slug && (
          <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripción
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="image" className="block text-sm font-medium mb-1">
          URL de imagen
        </Label>
        <Input
          id="image"
          type="text"
          {...register("image")}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-end pb-1">
          <Label className="flex items-center gap-2 cursor-pointer">
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <span className="text-sm font-medium">Activa</span>
          </Label>
        </div>
        <div>
          <Label htmlFor="sortOrder" className="block text-sm font-medium mb-1">
            Orden
          </Label>
          <Input
            id="sortOrder"
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
          {initialData ? "Guardar cambios" : "Crear categoría"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
