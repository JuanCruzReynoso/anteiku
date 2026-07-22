import Link from "next/link";
import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  await requireAdmin();

  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.email)],
  });

  // Get order counts and totals per user
  const customerStats = await db.execute(sql`
    SELECT
      ${orders.userId} as user_id,
      COUNT(${orders.id})::int as order_count,
      COALESCE(SUM(${orders.total}), 0)::int as total_spent
    FROM ${orders}
    WHERE ${orders.userId} IS NOT NULL
    GROUP BY ${orders.userId}
  `);

  const statsMap = new Map<
    string,
    { order_count: number; total_spent: number }
  >();
  for (const row of customerStats) {
    statsMap.set(row.user_id as string, {
      order_count: row.order_count as number,
      total_spent: row.total_spent as number,
    });
  }

  const totalCustomers = allUsers.length;
  const totalOrders = customerStats.reduce(
    (acc: number, r: Record<string, unknown>) =>
      acc + ((r.order_count as number) ?? 0),
    0
  );
  const totalRevenue = customerStats.reduce(
    (acc: number, r: Record<string, unknown>) =>
      acc + ((r.total_spent as number) ?? 0),
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total clientes</p>
          <p className="text-2xl font-bold">{totalCustomers}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total ordenes</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Ingresos totales</p>
          <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {allUsers.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">Sin clientes</p>
          <p className="text-sm mt-2">
            Los clientes que se registren apareceran aqui.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Telefono</th>
                <th className="text-right px-4 py-3 font-medium">
                  Total ordenes
                </th>
                <th className="text-right px-4 py-3 font-medium">
                  Total gastado
                </th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allUsers.map((user) => {
                const stats = statsMap.get(user.id);
                return (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {user.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {stats?.order_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatPrice(stats?.total_spent ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/customers/${user.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Ver perfil
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
