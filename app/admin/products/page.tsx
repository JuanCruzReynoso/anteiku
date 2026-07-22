import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { ProductActions } from "./product-actions-cell";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await requireAdmin();

  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { category: true },
  });

  const statusLabel: Record<string, string> = {
    active: "Activo",
    inactive: "Inactivo",
    draft: "Borrador",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          + Agregar producto
        </Link>
      </div>

      {allProducts.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">Sin productos</p>
          <p className="text-sm mt-2">
            Creá tu primer producto para empezar a vender.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Imagen</th>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Categoría</th>
                <th className="text-left px-4 py-3 font-medium">Precio</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allProducts.map((product) => (
                <tr key={product.id} className={`hover:bg-muted/30 ${product.status === "inactive" ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3">
                    {product.images && product.images.length > 0 ? (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        S/F
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category?.name ?? "Sin categoría"}
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.basePrice)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : product.status === "draft"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {statusLabel[product.status] ?? product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProductActions productId={product.id} status={product.status} />
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
