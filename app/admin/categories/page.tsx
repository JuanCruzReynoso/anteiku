import Link from "next/link";
import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { CategoryActions } from "./category-actions-cell";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  await requireAdmin();

  const allCategories = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder)],
    with: { products: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          + Agregar categoría
        </Link>
      </div>

      {allCategories.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">Sin categorías</p>
          <p className="text-sm mt-2">
            Creá tu primera categoría para organizar los productos.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Orden</th>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Productos</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allCategories.map((category) => (
                <tr key={category.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">
                    {category.sortOrder ?? 0}
                  </td>
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {category.slug}
                  </td>
                  <td className="px-4 py-3">{category.products.length}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        category.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {category.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CategoryActions categoryId={category.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
