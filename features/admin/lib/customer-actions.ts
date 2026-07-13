"use server";

import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "./actions";

export async function getCustomers() {
  await requireAdmin();
  return db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.email)],
  });
}

export async function getCustomerById(id: string) {
  await requireAdmin();
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      orders: {
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      },
    },
  });
}

export async function getCustomerStats() {
  await requireAdmin();
  const result = await db.execute(sql`
    SELECT
      COUNT(DISTINCT ${users.id})::int as total_customers,
      COUNT(${orders.id})::int as total_orders,
      COALESCE(SUM(${orders.total}), 0)::int as total_revenue
    FROM ${users}
    LEFT JOIN ${orders} ON ${users.id} = ${orders.userId}
  `);
  return result[0] as {
    total_customers: number;
    total_orders: number;
    total_revenue: number;
  };
}
