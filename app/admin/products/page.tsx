import { getProductsPaginated } from "@/features/admin/lib/product-actions";
import { ProductsList } from "./products-list";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  status?: string;
  page?: string;
}

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const result = await getProductsPaginated({
    search: params.search,
    status: params.status,
    page: params.page ? Number(params.page) : 1,
    pageSize: 20,
  });

  return (
    <ProductsList
      data={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
    />
  );
}
