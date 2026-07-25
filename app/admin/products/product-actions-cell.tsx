"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  deleteProductWithCheck,
  toggleProductVisibility,
  cloneProduct,
} from "@/features/admin/lib/product-actions";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductActionsProps {
  productId: string;
  status: string;
}

export function ProductActions({ productId, status }: ProductActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

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
    setIsDeleting(true);
    try {
      const result = await deleteProductWithCheck(productId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Producto eliminado");
        router.refresh();
      }
    } catch {
      toast.error("Error al eliminar el producto");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClone = async () => {
    setIsCloning(true);
    try {
      const result = await cloneProduct(productId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Producto clonado");
        router.push(`/admin/products/${result.id}`);
      }
    } catch {
      toast.error("Error al clonar el producto");
    } finally {
      setIsCloning(false);
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
        onClick={handleClone}
        disabled={isCloning}
        className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50"
        title="Clonar producto"
      >
        {isCloning ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <button
              className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
              title="Eliminar permanentemente"
            />
          }
        >
          <Trash2 className="size-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que querés eliminar este producto? Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="size-4 animate-spin mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
