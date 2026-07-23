import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { CategoriesList } from "./categories-list";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  const allCategories = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder)],
    with: { products: true },
  });

  const data = allCategories.map((cat) => ({
    id: cat.id,
    sortOrder: cat.sortOrder,
    name: cat.name,
    slug: cat.slug,
    productCount: cat.products.length,
    active: cat.active,
  }));

  return <CategoriesList data={data} />;
}
