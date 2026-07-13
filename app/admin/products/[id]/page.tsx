import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductForm } from "@/features/admin/ui/product-form";
import { VariantManager } from "./variant-manager";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { variants: true },
  });

  if (!product) {
    notFound();
  }

  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar producto</h1>

      <ProductForm
        categories={allCategories}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          basePrice: product.basePrice,
          categoryId: product.categoryId,
          status: product.status,
          featured: product.featured,
          images: (product.images as string[]) ?? [],
        }}
      />

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Variantes</h2>
        <VariantManager
          productId={product.id}
          initialVariants={product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            options: v.options as Record<string, string>,
          }))}
        />
      </div>
    </div>
  );
}
