import { getSubscriptionPlansPaginated, getUserSubscriptionsPaginated } from "@/features/admin/lib/subscription-actions";
import { SubscriptionsList } from "./subscriptions-list";

export const dynamic = "force-dynamic";

interface SearchParams {
  planSearch?: string;
  planStatus?: string;
  planPage?: string;
  subSearch?: string;
  subStatus?: string;
  subPage?: string;
}

export default async function AdminSubscriptions({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [plansResult, subsResult] = await Promise.all([
    getSubscriptionPlansPaginated({
      search: params.planSearch,
      status: params.planStatus,
      page: params.planPage ? Number(params.planPage) : 1,
      pageSize: 20,
    }),
    getUserSubscriptionsPaginated({
      search: params.subSearch,
      status: params.subStatus,
      page: params.subPage ? Number(params.subPage) : 1,
      pageSize: 20,
    }),
  ]);

  return (
    <SubscriptionsList
      plans={plansResult.data}
      plansTotal={plansResult.total}
      planPage={plansResult.page}
      subscriptions={subsResult.data}
      subsTotal={subsResult.total}
      subPage={subsResult.page}
      pageSize={plansResult.pageSize}
    />
  );
}
