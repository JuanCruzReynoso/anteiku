import { db } from "@/db";
import { shipmentMethods } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ShippingList } from "./shipping-list";

export const dynamic = "force-dynamic";

export type ShipmentMethod = {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  estimatedDays: number;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AdminShipping() {
  const methods = await db.query.shipmentMethods.findMany({
    orderBy: [asc(shipmentMethods.cost)],
  });

  return <ShippingList data={methods} />;
}
