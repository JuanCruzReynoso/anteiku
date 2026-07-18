"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "../lib/schemas";
import { createProduct, updateProduct } from "../lib/product-actions";
import { Button } from "@/components/ui/button";
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
    watch,
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

  const images = watch("images");

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
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          onChange={handleNameChange}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1">
          Slug
        </label>
        <input
          id="slug"
          type="text"
          {...register("slug")}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.slug && (
          <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-y"
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
          <label htmlFor="basePrice" className="block text-sm font-medium mb-1">
            Precio (ARS)
          </label>
          <input
            id="basePrice"
            type="number"
            {...register("basePrice", { valueAsNumber: true })}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.basePrice && (
            <p className="text-sm text-destructive mt-1">
              {errors.basePrice.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Categoría
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Estado
          </label>
          <select
            id="status"
            {...register("status")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="draft">Borrador</option>
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("featured")}
              className="rounded border-input"
            />
            <span className="text-sm font-medium">Destacado</span>
          </label>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium mb-1">Imágenes</label>
        <ImageUpload
          onUpload={(url) => {
            setValue("images", [...images, url]);
          }}
          disabled={isSubmitting}
        />
        <div className="flex gap-2 mb-2 mt-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="O pegá una URL de imagen"
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
