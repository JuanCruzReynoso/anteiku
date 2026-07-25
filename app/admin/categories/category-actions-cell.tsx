"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCategory } from "@/features/admin/lib/category-actions";
import { Loader2, Trash2 } from "lucide-react";
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

interface CategoryActionsProps {
  categoryId: string;
}

export function CategoryActions({ categoryId }: CategoryActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
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
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <button className="px-2 py-1 text-xs rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" />
          }
        >
          Eliminar
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar categoría</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que querés eliminar esta categoría? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
