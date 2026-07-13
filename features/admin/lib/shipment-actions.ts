"use server";

import { db } from "@/db";
import { shipmentMethods } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";
import { shipmentMethodSchema } from "./schemas";

export async function getShipmentMethods() {
  await requireAdmin();
  return db.query.shipmentMethods.findMany({
    orderBy: (methods, { asc }) => [asc(methods.cost)],
  });
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
