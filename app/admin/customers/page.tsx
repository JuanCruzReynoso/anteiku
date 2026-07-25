import { CustomersList } from "./customers-list";
import { getCustomersPaginated, getCustomerStats } from "@/features/admin/lib/customer-actions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminCustomers({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";

  const [result, stats] = await Promise.all([
    getCustomersPaginated({ search, page, pageSize: 20 }),
    getCustomerStats(),
  ]);

  return (
    <CustomersList
      data={result.data}
      totalCustomers={stats.total_customers}
      totalOrders={stats.total_orders}
      totalRevenue={stats.total_revenue}
      page={result.page}
      totalPages={Math.ceil(result.total / result.pageSize)}
      search={search}
      total={result.total}
    />
  );
}
