import { db } from "@/db";
import { discounts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DiscountsList } from "./discounts-list";

export const dynamic = "force-dynamic";

export type Discount = {
  id: string;
  name: string;
  type: string;
  value: number;
  productId: string | null;
  categoryId: string | null;
  minPurchase: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  usedCount: number;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AdminDiscounts() {
  const allDiscounts = await db.query.discounts.findMany({
    orderBy: [desc(discounts.createdAt)],
    with: { product: true, category: true },
  });

  const data = allDiscounts.map((d) => {
    let dateRange = "Sin limite";
    if (d.startsAt && d.endsAt) {
      dateRange = `${d.startsAt.toLocaleDateString("es-AR")} - ${d.endsAt.toLocaleDateString("es-AR")}`;
    } else if (d.startsAt) {
      dateRange = `Desde ${d.startsAt.toLocaleDateString("es-AR")}`;
    }

    return {
      ...d,
      productName: d.product?.name ?? null,
      categoryName: d.category?.name ?? null,
      dateRange,
    };
  });

  return <DiscountsList data={data} />;
}
