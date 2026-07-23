import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import { OrdersList } from "./orders-list";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
  });

  return <OrdersList data={allOrders} />;
}
