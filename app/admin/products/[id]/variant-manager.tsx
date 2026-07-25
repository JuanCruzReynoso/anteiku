"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createVariant,
  updateVariant,
  deleteVariant,
} from "@/features/admin/lib/product-actions";
import { variantSchema, type VariantInput } from "@/features/admin/lib/schemas";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options: Record<string, string>;
}

interface VariantManagerProps {
  productId: string;
  initialVariants: Variant[];
}

const emptyAddForm = { name: "", sku: "", price: 0, stock: 0, optionsJson: "" };

export function VariantManager({
  productId,
  initialVariants,
}: VariantManagerProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Separate form state for add and edit
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [editForm, setEditForm] = useState({
    name: "",
    sku: "",
    price: 0,
    stock: 0,
    optionsJson: "",
  });

  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  function parseOptions(json: string): Record<string, string> | undefined {
    if (!json.trim()) return undefined;
    try {
      return JSON.parse(json);
    } catch {
      return undefined;
    }
  }

  function validateAddForm(): boolean {
    const parsed = variantSchema.safeParse({
      name: addForm.name,
      sku: addForm.sku,
      price: addForm.price,
      stock: addForm.stock,
      options: parseOptions(addForm.optionsJson),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setAddErrors(fieldErrors);
      return false;
    }
    setAddErrors({});
    return true;
  }

  function validateEditForm(): boolean {
    const parsed = variantSchema.safeParse({
      name: editForm.name,
      sku: editForm.sku,
      price: editForm.price,
      stock: editForm.stock,
      options: parseOptions(editForm.optionsJson),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setEditErrors(fieldErrors);
      return false;
    }
    setEditErrors({});
    return true;
  }

  const handleAdd = async () => {
    if (!validateAddForm()) return;
    setIsAdding(true);
    try {
      const result = await createVariant({
        productId,
        name: addForm.name,
        sku: addForm.sku,
        price: addForm.price,
        stock: addForm.stock,
        options: parseOptions(addForm.optionsJson),
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setVariants([
        ...variants,
        { ...result, options: parseOptions(addForm.optionsJson) ?? {} },
      ]);
      setAddForm(emptyAddForm);
      toast.success("Variante creada");
    } catch {
      toast.error("Error al crear la variante");
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!validateEditForm()) return;
    try {
      const result = await updateVariant(id, {
        name: editForm.name,
        sku: editForm.sku,
        price: editForm.price,
        stock: editForm.stock,
        options: parseOptions(editForm.optionsJson),
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setVariants(
        variants.map((v) =>
          v.id === id
            ? { ...result, options: parseOptions(editForm.optionsJson) ?? v.options }
            : v
        )
      );
      setEditingId(null);
      toast.success("Variante actualizada");
    } catch {
      toast.error("Error al actualizar la variante");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteVariant(deleteTargetId);
      setVariants(variants.filter((v) => v.id !== deleteTargetId));
      toast.success("Variante eliminada");
    } catch {
      toast.error("Error al eliminar la variante");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const startEdit = (v: Variant) => {
    setEditingId(v.id);
    setEditErrors({});
    setEditForm({
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      optionsJson: Object.keys(v.options).length > 0 ? JSON.stringify(v.options, null, 2) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditErrors({});
  };

  return (
    <div className="border rounded-lg">
      {variants.length > 0 ? (
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Nombre</th>
              <th className="text-left px-4 py-2 font-medium">SKU</th>
              <th className="text-left px-4 py-2 font-medium">Precio</th>
              <th className="text-left px-4 py-2 font-medium">Stock</th>
              <th className="text-right px-4 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {variants.map((v) =>
              editingId === v.id ? (
                <tr key={v.id} className="bg-muted/20">
                  <td className="px-4 py-2">
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      aria-invalid={!!editErrors.name}
                    />
                    {editErrors.name && (
                      <p className="text-xs text-destructive mt-1">{editErrors.name}</p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      value={editForm.sku}
                      onChange={(e) =>
                        setEditForm({ ...editForm, sku: e.target.value })
                      }
                      aria-invalid={!!editErrors.sku}
                    />
                    {editErrors.sku && (
                      <p className="text-xs text-destructive mt-1">{editErrors.sku}</p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: Number(e.target.value) })
                      }
                      aria-invalid={!!editErrors.price}
                    />
                    {editErrors.price && (
                      <p className="text-xs text-destructive mt-1">{editErrors.price}</p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) =>
                        setEditForm({ ...editForm, stock: Number(e.target.value) })
                      }
                      aria-invalid={!!editErrors.stock}
                    />
                    {editErrors.stock && (
                      <p className="text-xs text-destructive mt-1">{editErrors.stock}</p>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(v.id)}
                      >
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={v.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{v.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{v.sku}</td>
                  <td className="px-4 py-2">
                    {v.price === 0 ? "Usa base" : `$${v.price}`}
                  </td>
                  <td className="px-4 py-2">{v.stock}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(v)}
                        className="p-1 rounded hover:bg-muted text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(v.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      ) : (
        <p className="p-4 text-sm text-muted-foreground text-center">
          Sin variantes. Agrega una variante para definir tamanos, colores, etc.
        </p>
      )}

      {/* Add form */}
      <div className="border-t p-4">
        <p className="text-sm font-medium mb-2">Agregar variante</p>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div>
            <Input
              placeholder="Nombre (ej: Negro / L)"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              aria-invalid={!!addErrors.name}
            />
            {addErrors.name && (
              <p className="text-xs text-destructive mt-1">{addErrors.name}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="SKU"
              value={addForm.sku}
              onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
              aria-invalid={!!addErrors.sku}
            />
            {addErrors.sku && (
              <p className="text-xs text-destructive mt-1">{addErrors.sku}</p>
            )}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Precio (0 = base)"
              value={addForm.price || ""}
              onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })}
              aria-invalid={!!addErrors.price}
            />
            {addErrors.price && (
              <p className="text-xs text-destructive mt-1">{addErrors.price}</p>
            )}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Stock"
              value={addForm.stock || ""}
              onChange={(e) => setAddForm({ ...addForm, stock: Number(e.target.value) })}
              aria-invalid={!!addErrors.stock}
            />
            {addErrors.stock && (
              <p className="text-xs text-destructive mt-1">{addErrors.stock}</p>
            )}
          </div>
        </div>
        <div className="mb-2">
          <Input
            placeholder='Opciones JSON (ej: {"color":"Negro","size":"L"})'
            value={addForm.optionsJson}
            onChange={(e) => setAddForm({ ...addForm, optionsJson: e.target.value })}
          />
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={isAdding}
        >
          {isAdding ? (
            <Loader2 className="size-4 animate-spin mr-1" />
          ) : (
            <Plus className="size-4 mr-1" />
          )}
          Agregar
        </Button>
      </div>
      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar variante</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que querés eliminar esta variante? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)}>
              Cancelar
            </AlertDialogCancel>
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
