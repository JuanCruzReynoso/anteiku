import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProductsList } from "./products-list";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { category: true },
  });

  const data = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: p.category?.name ?? "Sin categoría",
    basePrice: p.basePrice,
    status: p.status,
    imageUrl: p.images?.[0] ?? null,
  }));

  return <ProductsList data={data} />;
}
