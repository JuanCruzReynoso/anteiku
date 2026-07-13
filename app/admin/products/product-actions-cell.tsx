"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct } from "@/features/admin/lib/product-actions";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface ProductActionsProps {
  productId: string;
}

export function ProductActions({ productId }: ProductActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Estas seguro de que queres eliminar este producto?")) return;
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
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
        title="Eliminar"
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
