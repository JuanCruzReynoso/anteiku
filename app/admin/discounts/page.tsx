import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { discounts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { DiscountActions } from "./discount-actions-cell";
import { CreateDiscountButton } from "./create-discount-button";

export const dynamic = "force-dynamic";

export type Discount = {
  id: string;
  name: string;
  type: string;
  value: number;
  productId: string | null;
  categoryId: string | null;
  minPurchase: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AdminDiscounts() {
  await requireAdmin();

  const allDiscounts = await db.query.discounts.findMany({
    orderBy: [desc(discounts.createdAt)],
    with: { product: true, category: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Descuentos</h1>
        <CreateDiscountButton />
      </div>

      {allDiscounts.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">Sin descuentos</p>
          <p className="text-sm mt-2">
            Agragate tu primer descuento para ofrecer precios especiales.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-right px-4 py-3 font-medium">Valor</th>
                <th className="text-left px-4 py-3 font-medium">Producto/Categoria</th>
                <th className="text-left px-4 py-3 font-medium">Vigencia</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allDiscounts.map((discount) => (
                <tr key={discount.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{discount.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {discount.type === "percentage" ? "Porcentaje" : "Fijo"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {discount.type === "percentage"
                      ? `${discount.value}%`
                      : formatPrice(discount.value)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {discount.product?.name ?? discount.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {discount.startsAt && discount.endsAt
                      ? `${discount.startsAt.toLocaleDateString("es-AR")} - ${discount.endsAt.toLocaleDateString("es-AR")}`
                      : discount.startsAt
                        ? `Desde ${discount.startsAt.toLocaleDateString("es-AR")}`
                        : "Sin limite"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        discount.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {discount.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DiscountActions discount={discount} />
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
