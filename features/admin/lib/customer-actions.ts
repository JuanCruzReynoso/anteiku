"use server";

import { db } from "@/db";
import { users, orders, addresses } from "@/db/schema";
import { eq, desc, sql, ilike, and, or } from "drizzle-orm";
import { requireAdmin } from "./actions";

export async function getCustomers() {
  await requireAdmin();
  return db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.email)],
  });
}

export async function getCustomersPaginated(params: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  const { search, page = 1, pageSize = 20 } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db.query.users.findMany({
      where,
      orderBy: [desc(users.createdAt)],
      limit: pageSize,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  // Get order stats for each user
  const userIds = data.map((u) => u.id);
  let orderStats: Array<{
    user_id: string;
    order_count: number;
    total_spent: number;
    last_order_date: Date | null;
  }> = [];

  if (userIds.length > 0) {
    orderStats = await db.execute(sql`
      SELECT
        user_id,
        COUNT(id)::int as order_count,
        COALESCE(SUM(total), 0)::int as total_spent,
        MAX(created_at) as last_order_date
      FROM orders
      WHERE user_id = ANY(${userIds})
      GROUP BY user_id
    `);
  }

  const statsMap = new Map(
    orderStats.map((row) => [row.user_id, row])
  );

  return {
    data: data.map((user) => {
      const stats = statsMap.get(user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        orderCount: stats?.order_count ?? 0,
        totalSpent: stats?.total_spent ?? 0,
        lastOrderDate: stats?.last_order_date ?? null,
      };
    }),
    total,
    page,
    pageSize,
  };
}

export async function getCustomerById(id: string) {
  await requireAdmin();
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) return null;

  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, id),
    orderBy: [desc(orders.createdAt)],
  });

  const userAddresses = await db.query.addresses.findMany({
    where: eq(addresses.userId, id),
    orderBy: [desc(addresses.isDefault)],
  });

  const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
  const lastOrderDate =
    userOrders.length > 0 ? userOrders[0].createdAt : null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    orders: userOrders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
    })),
    addresses: userAddresses.map((a) => ({
      id: a.id,
      name: a.name,
      street: a.street,
      streetNumber: a.streetNumber,
      apartment: a.apartment,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      phone: a.phone,
      isDefault: a.isDefault,
    })),
    lastOrderDate,
    totalSpent,
  };
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
