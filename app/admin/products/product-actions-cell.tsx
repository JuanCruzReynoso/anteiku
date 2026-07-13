"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct, toggleProductVisibility } from "@/features/admin/lib/product-actions";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";

interface ProductActionsProps {
  productId: string;
  status: string;
}

export function ProductActions({ productId, status }: ProductActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isVisible = status === "active";

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const result = await toggleProductVisibility(productId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isVisible ? "Producto ocultado" : "Producto visible");
        router.refresh();
      }
    } catch {
      toast.error("Error al cambiar visibilidad");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Estas seguro de que queres eliminar este producto? Esta accion no se puede deshacer.")) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productId);
      toast.success("Producto eliminado");
      router.refresh();
    } catch {
      toast.error("Error al eliminar el producto");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/products/${productId}`}
        className="p-1.5 rounded hover:bg-muted transition-colors"
        title="Editar"
      >
        <Pencil className="size-4" />
      </Link>
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
          isVisible
            ? "hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400"
            : "hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400"
        }`}
        title={isVisible ? "Ocultar producto" : "Mostrar producto"}
      >
        {isToggling ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isVisible ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
        title="Eliminar permanentemente"
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </button>
    </div>
  );
}
