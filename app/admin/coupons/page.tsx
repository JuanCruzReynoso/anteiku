import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { CouponActions } from "./coupon-actions-cell";
import { CreateCouponButton } from "./create-coupon-button";
import { DataTable, type Column, type ActionConfig } from "@/components/admin/data-table";

export const dynamic = "force-dynamic";

export type Coupon = {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

type CouponRow = Coupon & {
  dateRange: string;
};

const columns: Column<CouponRow>[] = [
  {
    key: "code",
    header: "Codigo",
    type: "monospace",
    fontWeight: "bold",
  },
  {
    key: "name",
    header: "Nombre",
    type: "text",
  },
  {
    key: "type",
    header: "Tipo",
    type: "text",
    render: (row) => (
      <span className="text-muted-foreground">
        {row.type === "percentage"
          ? "Porcentaje"
          : row.type === "fixed"
            ? "Fijo"
            : "Envio gratis"}
      </span>
    ),
  },
  {
    key: "value",
    header: "Valor",
    type: "conditional",
    align: "right",
    render: (row) =>
      row.type === "percentage"
        ? `${row.value}%`
        : row.type === "free_shipping"
          ? "—"
          : formatPrice(row.value),
  },
  {
    key: "usedCount",
    header: "Usos",
    type: "conditional",
    align: "right",
    render: (row) => (
      <span className="tabular-nums">
        {row.usedCount}
        {row.maxUses ? ` / ${row.maxUses}` : " / ∞"}
      </span>
    ),
  },
  {
    key: "dateRange",
    header: "Vigencia",
    type: "text",
    hideOnMobile: true,
    render: (row) => (
      <span className="text-muted-foreground text-xs">{row.dateRange}</span>
    ),
  },
  {
    key: "active",
    header: "Estado",
    type: "badge",
    badgeMap: {
      true: {
        label: "Activo",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      false: {
        label: "Inactivo",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      },
    },
  },
];

export default async function AdminCoupons() {
  await requireAdmin();

  const allCoupons = await db.query.coupons.findMany({
    orderBy: [desc(coupons.createdAt)],
  });

  const data: CouponRow[] = allCoupons.map((c) => {
    let dateRange = "Sin limite";
    if (c.startsAt && c.endsAt) {
      dateRange = `${c.startsAt.toLocaleDateString("es-AR")} - ${c.endsAt.toLocaleDateString("es-AR")}`;
    } else if (c.startsAt) {
      dateRange = `Desde ${c.startsAt.toLocaleDateString("es-AR")}`;
    }

    return { ...c, dateRange };
  });

  const actions: ActionConfig<CouponRow> = {
    type: "icon-buttons",
    component: ({ row }) => <CouponActions coupon={row} />,
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      actions={actions}
      header={{
        title: "Cupones",
        cta: <CreateCouponButton />,
      }}
      empty={{
        title: "Sin cupones",
        description: "Agragate tu primer cupon para ofrecer descuentos por codigo.",
      }}
      keyExtractor={(row) => row.id}
    />
  );
}
