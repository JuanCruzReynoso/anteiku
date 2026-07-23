import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CouponsList } from "./coupons-list";

export const dynamic = "force-dynamic";

export type Coupon = {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AdminCoupons() {
  const allCoupons = await db.query.coupons.findMany({
    orderBy: [desc(coupons.createdAt)],
  });

  const data = allCoupons.map((c) => {
    let dateRange = "Sin limite";
    if (c.startsAt && c.endsAt) {
      dateRange = `${c.startsAt.toLocaleDateString("es-AR")} - ${c.endsAt.toLocaleDateString("es-AR")}`;
    } else if (c.startsAt) {
      dateRange = `Desde ${c.startsAt.toLocaleDateString("es-AR")}`;
    }

    return { ...c, dateRange };
  });

  return <CouponsList data={data} />;
}
