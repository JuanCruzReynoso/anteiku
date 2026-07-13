import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/lib/actions";
import { getCategoryById } from "@/features/admin/lib/category-actions";
import { CategoryForm } from "@/features/admin/ui/category-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar categoría</h1>

      <div className="mb-4 text-sm text-muted-foreground">
        {category.products.length} producto{category.products.length !== 1 ? "s" : ""} asociado{category.products.length !== 1 ? "s" : ""}
      </div>

      <CategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? undefined,
          image: category.image ?? undefined,
          active: category.active ?? true,
          sortOrder: category.sortOrder ?? 0,
        }}
      />
    </div>
  );
}
