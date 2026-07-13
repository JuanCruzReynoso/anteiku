"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCategory } from "@/features/admin/lib/category-actions";

interface CategoryActionsProps {
  categoryId: string;
}

export function CategoryActions({ categoryId }: CategoryActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro que querés eliminar esta categoría?")) return;
    try {
      await deleteCategory(categoryId);
      toast.success("Categoría eliminada");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar la categoría"
      );
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/categories/${categoryId}`}
        className="px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
      >
        Editar
      </Link>
      <button
        onClick={handleDelete}
        className="px-2 py-1 text-xs rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
      >
        Eliminar
      </button>
    </div>
  );
}
