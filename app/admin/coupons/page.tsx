import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { CouponActions } from "./coupon-actions-cell";
import { CreateCouponButton } from "./create-coupon-button";

export const dynamic = "force-dynamic";

export type Coupon = {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AdminCoupons() {
  await requireAdmin();

  const allCoupons = await db.query.coupons.findMany({
    orderBy: [desc(coupons.createdAt)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cupones</h1>
        <CreateCouponButton />
      </div>

      {allCoupons.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">Sin cupones</p>
          <p className="text-sm mt-2">
            Agragate tu primer cupon para ofrecer descuentos por codigo.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Codigo</th>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-right px-4 py-3 font-medium">Valor</th>
                <th className="text-right px-4 py-3 font-medium">Usos</th>
                <th className="text-left px-4 py-3 font-medium">Vigencia</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                  <td className="px-4 py-3">{coupon.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {coupon.type === "percentage"
                      ? "Porcentaje"
                      : coupon.type === "fixed"
                        ? "Fijo"
                        : "Envio gratis"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : coupon.type === "free_shipping"
                        ? "—"
                        : formatPrice(coupon.value)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {coupon.usedCount}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {coupon.startsAt && coupon.endsAt
                      ? `${coupon.startsAt.toLocaleDateString("es-AR")} - ${coupon.endsAt.toLocaleDateString("es-AR")}`
                      : coupon.startsAt
                        ? `Desde ${coupon.startsAt.toLocaleDateString("es-AR")}`
                        : "Sin limite"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        coupon.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {coupon.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CouponActions coupon={coupon} />
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
