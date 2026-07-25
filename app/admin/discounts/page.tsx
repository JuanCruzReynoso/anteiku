import { getDiscountsPaginated } from "@/features/admin/lib/discount-actions";
import { DiscountsList } from "./discounts-list";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  status?: string;
  page?: string;
}

export default async function AdminDiscounts({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const result = await getDiscountsPaginated({
    search: params.search,
    status: params.status,
    page: params.page ? Number(params.page) : 1,
    pageSize: 20,
  });

  return (
    <DiscountsList
      data={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
    />
  );
}
