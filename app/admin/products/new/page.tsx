import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ProductForm } from "@/features/admin/ui/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();

  const allCategories = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder)],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo producto</h1>
      <ProductForm categories={allCategories} />
    </div>
  );
}
