import { requireAdmin } from "@/features/admin/lib/actions";
import { CategoryForm } from "@/features/admin/ui/category-form";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nueva categoría</h1>
      <CategoryForm />
    </div>
  );
}
