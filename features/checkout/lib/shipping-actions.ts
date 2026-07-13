"use server";

import { db } from "@/db";
import { shipmentMethods } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
}

export async function getActiveShippingMethods(): Promise<ShippingMethod[]> {
  const methods = await db.query.shipmentMethods.findMany({
    where: eq(shipmentMethods.active, true),
    orderBy: (shipmentMethods, { asc }) => [asc(shipmentMethods.cost)],
  });

  return methods.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description ?? "",
    cost: m.cost,
    estimatedDays: m.estimatedDays,
  }));
}
