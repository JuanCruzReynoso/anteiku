import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";

export const dynamic = "force-dynamic";

type CustomerRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
};

const columns: Column<CustomerRow>[] = [
  {
    key: "name",
    header: "Nombre",
    type: "text",
    fontWeight: "bold",
    fallback: "—",
  },
  {
    key: "email",
    header: "Email",
    type: "text",
  },
  {
    key: "phone",
    header: "Telefono",
    type: "text",
    hideOnMobile: true,
  },
  {
    key: "orderCount",
    header: "Total ordenes",
    type: "count",
    align: "right",
  },
  {
    key: "totalSpent",
    header: "Total gastado",
    type: "currency",
    align: "right",
  },
];

const actions: ActionConfig<CustomerRow> = {
  type: "link",
  href: (row) => `/admin/customers/${row.id}`,
  label: "Ver perfil",
};

export default async function AdminCustomers() {
  await requireAdmin();

  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.email)],
  });

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

  const data: CustomerRow[] = allUsers.map((user) => {
    const stats = statsMap.get(user.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      orderCount: stats?.order_count ?? 0,
      totalSpent: stats?.total_spent ?? 0,
    };
  });

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

      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        empty={{
          title: "Sin clientes",
          description: "Los clientes que se registren apareceran aqui.",
        }}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}
