import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq, ilike, and, count, type SQL } from "drizzle-orm";
import { OrdersList } from "./orders-list";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function AdminOrders({ searchParams }: Props) {
  const { page: pageParam, search, status } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const offset = (page - 1) * PAGE_SIZE;

  // Build conditions
  const conditions: SQL[] = [];
  if (search) {
    conditions.push(
      ilike(orders.customerEmail, `%${search}%`)
    );
  }
  if (status) {
    conditions.push(eq(orders.status, status as OrderStatus));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch orders and count in parallel
  const [allOrders, countResult] = await Promise.all([
    db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: PAGE_SIZE,
      offset,
      where: whereClause,
    }),
    db.select({ count: count() }).from(orders).where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <OrdersList
      data={allOrders}
      page={page}
      totalPages={totalPages}
      search={search}
      statusFilter={status}
    />
  );
}
