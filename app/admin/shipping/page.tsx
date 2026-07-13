import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { shipmentMethods } from "@/db/schema";
import { asc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { ShipmentActions } from "./shipment-actions-cell";
import { CreateShipmentButton } from "./create-shipment-button";

export const dynamic = "force-dynamic";

export type ShipmentMethod = {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  estimatedDays: number;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AdminShipping() {
  await requireAdmin();

  const methods = await db.query.shipmentMethods.findMany({
    orderBy: [asc(shipmentMethods.cost)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Métodos de envío</h1>
        <CreateShipmentButton />
      </div>

      {methods.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">Sin métodos de envío</p>
          <p className="text-sm mt-2">
            Agregá tu primer método de envío para que los clientes puedan elegir
            opciones de entrega.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Descripción</th>
                <th className="text-right px-4 py-3 font-medium">Costo</th>
                <th className="text-right px-4 py-3 font-medium">Días estimados</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {methods.map((method) => (
                <tr key={method.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{method.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {method.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatPrice(method.cost)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {method.estimatedDays} {method.estimatedDays === 1 ? "día" : "días"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        method.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {method.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ShipmentActions method={method} />
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
