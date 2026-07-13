import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { users, orders, addresses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    notFound();
  }

  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, id),
    orderBy: [desc(orders.createdAt)],
  });

  const userAddresses = await db.query.addresses.findMany({
    where: eq(addresses.userId, id),
    orderBy: [desc(addresses.isDefault)],
  });

  const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Perfil del cliente</h1>

      {/* Customer info */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Informacion personal
        </h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="font-medium">{user.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Telefono</dt>
            <dd>{user.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rol</dt>
            <dd className="capitalize">{user.role}</dd>
          </div>
          {user.address && (
            <>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Direccion</dt>
                <dd>
                  {user.address.street}, {user.address.city},{" "}
                  {user.address.state} {user.address.zip},{" "}
                  {user.address.country}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total ordenes</p>
          <p className="text-2xl font-bold">{userOrders.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total gastado</p>
          <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Miembro desde</p>
          <p className="text-lg font-medium">
            {user.emailVerified
              ? new Date(user.emailVerified).toLocaleDateString("es-AR")
              : "—"}
          </p>
        </div>
      </div>

      {/* Addresses */}
      {userAddresses.length > 0 && (
        <div className="border rounded-lg mb-6">
          <div className="p-4 border-b">
            <h2 className="text-sm font-medium text-muted-foreground">
              Direcciones ({userAddresses.length})
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {userAddresses.map((address) => (
              <div key={address.id} className="flex items-start justify-between">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{address.name}</p>
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {address.street}
                    {address.streetNumber && `, ${address.streetNumber}`}
                    {address.apartment && ` (${address.apartment})`}
                  </p>
                  <p className="text-muted-foreground">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-muted-foreground">{address.country}</p>
                  {address.phone && (
                    <p className="text-muted-foreground">Tel: {address.phone}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order history */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-sm font-medium text-muted-foreground">
            Historial de ordenes ({userOrders.length})
          </h2>
        </div>
        {userOrders.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-2 font-medium">#</th>
                <th className="text-left px-4 py-2 font-medium">Estado</th>
                <th className="text-right px-4 py-2 font-medium">Total</th>
                <th className="text-left px-4 py-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {userOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono text-xs">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs">
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-4 text-sm text-muted-foreground text-center">
            Este cliente aun no realizo ninguna orden.
          </p>
        )}
      </div>
    </div>
  );
}
