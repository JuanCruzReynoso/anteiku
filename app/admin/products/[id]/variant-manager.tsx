"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createVariant,
  updateVariant,
  deleteVariant,
} from "@/features/admin/lib/product-actions";
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

export function VariantManager({
  productId,
  initialVariants,
}: VariantManagerProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: 0,
    stock: 0,
  });

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const variant = await createVariant({
        productId,
        name: form.name,
        sku: form.sku,
        price: form.price,
        stock: form.stock,
      });
      setVariants([...variants, { ...variant, options: {} }]);
      setForm({ name: "", sku: "", price: 0, stock: 0 });
      toast.success("Variante creada");
    } catch {
      toast.error("Error al crear la variante");
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const variant = await updateVariant(id, {
        name: form.name,
        sku: form.sku,
        price: form.price,
        stock: form.stock,
      });
      setVariants(
        variants.map((v) =>
          v.id === id ? { ...variant, options: v.options } : v
        )
      );
      setEditingId(null);
      setForm({ name: "", sku: "", price: 0, stock: 0 });
      toast.success("Variante actualizada");
    } catch {
      toast.error("Error al actualizar la variante");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta variante?")) return;
    try {
      await deleteVariant(id);
      setVariants(variants.filter((v) => v.id !== id));
      toast.success("Variante eliminada");
    } catch {
      toast.error("Error al eliminar la variante");
    }
  };

  const startEdit = (v: Variant) => {
    setEditingId(v.id);
    setForm({ name: v.name, sku: v.sku, price: v.price, stock: v.stock });
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
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full rounded border bg-background px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={form.sku}
                      onChange={(e) =>
                        setForm({ ...form, sku: e.target.value })
                      }
                      className="w-full rounded border bg-background px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                      }
                      className="w-full rounded border bg-background px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: Number(e.target.value) })
                      }
                      className="w-full rounded border bg-background px-2 py-1 text-sm"
                    />
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
                        onClick={() => setEditingId(null)}
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
                        onClick={() => handleDelete(v.id)}
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
          <input
            placeholder="Nombre (ej: Negro / L)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border bg-background px-2 py-1 text-sm"
          />
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="rounded border bg-background px-2 py-1 text-sm"
          />
          <input
            type="number"
            placeholder="Precio (0 = base)"
            value={form.price || ""}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="rounded border bg-background px-2 py-1 text-sm"
          />
          <input
            type="number"
            placeholder="Stock"
            value={form.stock || ""}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="rounded border bg-background px-2 py-1 text-sm"
          />
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={isAdding || !form.name || !form.sku}
        >
          {isAdding ? (
            <Loader2 className="size-4 animate-spin mr-1" />
          ) : (
            <Plus className="size-4 mr-1" />
          )}
          Agregar
        </Button>
      </div>
    </div>
  );
}
