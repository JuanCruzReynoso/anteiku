import { getCouponsPaginated } from "@/features/admin/lib/coupon-actions";
import { CouponsList } from "./coupons-list";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  status?: string;
  page?: string;
}

export default async function AdminCoupons({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const result = await getCouponsPaginated({
    search: params.search,
    status: params.status,
    page: params.page ? Number(params.page) : 1,
    pageSize: 20,
  });

  return (
    <CouponsList
      data={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
    />
  );
}
