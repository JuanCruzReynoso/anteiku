"use client";

import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "../lib/schemas";
import { createProduct, updateProduct } from "../lib/product-actions";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { ImageUpload } from "./image-upload";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    categoryId: string | null;
    status: string;
    featured: boolean;
    images: string[];
  };
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      basePrice: initialData?.basePrice ?? 0,
      categoryId: initialData?.categoryId ?? "",
      status: (initialData?.status as "active" | "inactive" | "draft") ?? "active",
      featured: initialData?.featured ?? false,
      images: initialData?.images ?? [],
    },
  });

  const images = useWatch({ control, name: "images" });

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

  const addImage = () => {
    if (imageUrl.trim()) {
      setValue("images", [...images, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setValue(
      "images",
      images.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: ProductInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateProduct(initialData.id, data);
        toast.success("Producto actualizado");
      } else {
        await createProduct(data);
        toast.success("Producto creado");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error("Error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Name */}
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

      {/* Slug */}
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

      {/* Description */}
      <div>
        <Label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripción
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={4}
          className="resize-y"
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Price + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="basePrice" className="block text-sm font-medium mb-1">
            Precio (ARS)
          </Label>
          <Input
            id="basePrice"
            type="number"
            {...register("basePrice", { valueAsNumber: true })}
          />
          {errors.basePrice && (
            <p className="text-sm text-destructive mt-1">
              {errors.basePrice.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Categoría
          </Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seleccionar categoría</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-sm text-destructive mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      </div>

      {/* Status + Featured */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status" className="block text-sm font-medium mb-1">
            Estado
          </Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex items-end pb-1">
          <Label className="flex items-center gap-2 cursor-pointer">
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <span className="text-sm font-medium">Destacado</span>
          </Label>
        </div>
      </div>

      {/* Images */}
      <div>
        <Label className="block text-sm font-medium mb-1">Imágenes</Label>
        <ImageUpload
          onUpload={(url) => {
            setValue("images", [...images, url]);
          }}
          disabled={isSubmitting}
        />
        <div className="flex gap-2 mb-2 mt-2">
          <Input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="O pegá una URL de imagen"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            <Plus className="size-4" />
          </Button>
        </div>
        {images.length > 0 && (
          <div className="space-y-1">
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="truncate flex-1 text-muted-foreground">
                  {img}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.images && (
          <p className="text-sm text-destructive mt-1">
            {errors.images.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
          {initialData ? "Guardar cambios" : "Crear producto"}
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
