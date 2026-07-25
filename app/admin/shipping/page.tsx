import { getShipmentMethodsPaginated } from "@/features/admin/lib/shipment-actions";
import { ShippingList } from "./shipping-list";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  status?: string;
  page?: string;
}

export default async function AdminShipping({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const result = await getShipmentMethodsPaginated({
    search: params.search,
    status: params.status,
    page: params.page ? Number(params.page) : 1,
    pageSize: 20,
  });

  return (
    <ShippingList
      data={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
    />
  );
}
