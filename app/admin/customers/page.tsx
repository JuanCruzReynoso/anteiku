import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { CustomersList } from "./customers-list";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
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

  const data = allUsers.map((user) => {
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
    <CustomersList
      data={data}
      totalCustomers={totalCustomers}
      totalOrders={totalOrders}
      totalRevenue={totalRevenue}
    />
  );
}
