"use server";

import { db } from "@/db";
import { shipmentMethods } from "@/db/schema";
import { eq, ilike, and, sql, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { shipmentMethodSchema } from "./schemas";

export async function getShipmentMethods() {
  await requireAdmin();
  return db.query.shipmentMethods.findMany({
    orderBy: (methods, { asc }) => [asc(methods.cost)],
  });
}

/**
 * Fetches shipment methods with search, status filter, and offset-based pagination.
 */
export async function getShipmentMethodsPaginated(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  const { search, status, page = 1, pageSize = 20 } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (search) {
    conditions.push(ilike(shipmentMethods.name, `%${search}%`));
  }
  if (status) {
    conditions.push(eq(shipmentMethods.active, status === "active"));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db.query.shipmentMethods.findMany({
      where,
      orderBy: [asc(shipmentMethods.cost)],
      limit: pageSize,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(shipmentMethods)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return { data, total, page, pageSize };
}

export async function getActiveShipmentMethods() {
  return db.query.shipmentMethods.findMany({
    where: eq(shipmentMethods.active, true),
    orderBy: (methods, { asc }) => [asc(methods.cost)],
  });
}

export async function createShipmentMethod(data: {
  name: string;
  description?: string;
  cost: number;
  estimatedDays: number;
}) {
  const validated = shipmentMethodSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [method] = await db
    .insert(shipmentMethods)
    .values(validated.data)
    .returning();
  revalidatePath("/admin/shipping");
  return method;
}

export async function updateShipmentMethod(
  id: string,
  data: {
    name?: string;
    description?: string;
    cost?: number;
    estimatedDays?: number;
    active?: boolean;
  }
) {
  const validated = shipmentMethodSchema.partial().safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }
  await requireAdmin();
  const [method] = await db
    .update(shipmentMethods)
    .set({ ...validated.data, updatedAt: new Date() })
    .where(eq(shipmentMethods.id, id))
    .returning();
  revalidatePath("/admin/shipping");
  return method;
}

export async function deleteShipmentMethod(id: string) {
  await requireAdmin();
  await db.delete(shipmentMethods).where(eq(shipmentMethods.id, id));
  revalidatePath("/admin/shipping");
}
