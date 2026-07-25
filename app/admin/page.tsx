import { db } from "@/db";
import {
  products,
  orders,
  users,
  variants,
  orderItems,
  userSubscriptions,
  subscriptionPlans,
} from "@/db/schema";
import {
  count,
  sql,
  eq,
  gte,
  desc,
  asc,
  ne,
  and,
  inArray,
} from "drizzle-orm";
import { formatPrice, formatPercent } from "@/lib/utils";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Zap,
} from "lucide-react";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD ?? 5);

// ─── Date Boundaries ──────────────────────────────────
const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const startOfYesterday = new Date(startOfDay);
startOfYesterday.setDate(startOfDay.getDate() - 1);
const startOfWeek = new Date(startOfDay);
startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay() + 1); // Monday
const startOfLastWeek = new Date(startOfWeek);
startOfLastWeek.setDate(startOfWeek.getDate() - 7);
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

// ─── Helpers ──────────────────────────────────────────
function trendPct(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return 100; // new activity
  return ((current - previous) / previous) * 100;
}

function TrendBadge({
  current,
  previous,
  label,
}: {
  current: number;
  previous: number;
  label: string;
}) {
  const pct = trendPct(current, previous);
  if (pct === null) return null;
  const isPositive = pct > 0;
  const isZero = pct === 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isZero
          ? "text-muted-foreground"
          : isPositive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
      }`}
    >
      <span className="sr-only">
        {isZero
          ? "no change"
          : isPositive
            ? `${Math.round(pct)}% increase`
            : `${Math.round(Math.abs(pct))}% decrease`}{" "}
        {label}
      </span>
      {isZero ? "—" : isPositive ? "↑" : "↓"} {formatPercent(pct)}
      <span className="text-muted-foreground font-normal">vs {label}</span>
    </span>
  );
}

function WeeklyBarChart({ dailyRevenue }: { dailyRevenue: number[] }) {
  const maxRevenue = Math.max(...dailyRevenue, 1);
  const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];
  return (
    <div className="grid grid-cols-7 gap-2 h-24 items-end">
      {dailyRevenue.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-full bg-emerald-500/20 rounded-t"
            style={{ height: `${(day / maxRevenue) * 100}%` }}
            aria-label={`${dayLabels[i]}: ${formatPrice(day)}`}
          />
          <span className="text-[10px] text-muted-foreground">
            {dayLabels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function LowStockRow({ variant }: { variant: { variantName: string; productName: string; stock: number } }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{variant.variantName}</p>
        <p className="text-[10px] text-muted-foreground truncate">{variant.productName}</p>
      </div>
      <span
        className={`text-sm font-bold tabular-nums ${
          variant.stock === 0 ? "text-rose-600 dark:text-rose-400" : "text-rose-500"
        }`}
      >
        {variant.stock}
      </span>
    </div>
  );
}

function TopProductRow({
  product,
  rank,
}: {
  product: { name: string; revenue: number; units: number };
  rank: number;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-bold text-muted-foreground tabular-nums w-5 text-center">
          {rank}
        </span>
        <p className="text-sm font-medium truncate">{product.name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium">{formatPrice(product.revenue)}</p>
        <p className="text-[10px] text-muted-foreground">{product.units} unidades</p>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────
export default async function AdminDashboard() {
  const session = await auth();

  // ─── Queries (5 parallel) ──────────────────────────
  const [revenueTrends, topProducts, lowStockItems, subscriptionMetrics, pendingOrders] =
    await Promise.all([
      // Query 1: Revenue trends
      db.execute(sql`
        SELECT
          COALESCE(SUM(CASE WHEN ${orders.createdAt} >= ${startOfDay} THEN ${orders.total} END), 0)::int as today,
          COALESCE(SUM(CASE WHEN ${orders.createdAt} >= ${startOfYesterday} AND ${orders.createdAt} < ${startOfDay} THEN ${orders.total} END), 0)::int as yesterday,
          COALESCE(SUM(CASE WHEN ${orders.createdAt} >= ${startOfWeek} THEN ${orders.total} END), 0)::int as this_week,
          COALESCE(SUM(CASE WHEN ${orders.createdAt} >= ${startOfLastWeek} AND ${orders.createdAt} < ${startOfWeek} THEN ${orders.total} END), 0)::int as last_week,
          COALESCE(SUM(CASE WHEN ${orders.createdAt} >= ${startOfMonth} THEN ${orders.total} END), 0)::int as this_month,
          COALESCE(SUM(CASE WHEN ${orders.createdAt} >= ${startOfLastMonth} AND ${orders.createdAt} < ${startOfMonth} THEN ${orders.total} END), 0)::int as last_month,
          COUNT(CASE WHEN ${orders.createdAt} >= ${startOfDay} THEN 1 END)::int as today_orders,
          COUNT(CASE WHEN ${orders.createdAt} >= ${startOfYesterday} AND ${orders.createdAt} < ${startOfDay} THEN 1 END)::int as yesterday_orders
        FROM ${orders}
        WHERE ${orders.status} != 'cancelled'
      `),

      // Query 2: Top 5 products by revenue this month
      db
        .select({
          name: products.name,
          revenue: sql<number>`COALESCE(SUM(${orderItems.unitPrice} * ${orderItems.quantity}), 0)::int`,
          units: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
        })
        .from(orderItems)
        .innerJoin(variants, eq(orderItems.variantId, variants.id))
        .innerJoin(products, eq(variants.productId, products.id))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            ne(orders.status, "cancelled"),
            gte(orders.createdAt, startOfMonth)
          )
        )
        .groupBy(products.id, products.name)
        .orderBy(desc(sql`SUM(${orderItems.unitPrice} * ${orderItems.quantity})`))
        .limit(5),

      // Query 3: Low stock with product names
      db
        .select({
          variantName: variants.name,
          productName: products.name,
          stock: variants.stock,
        })
        .from(variants)
        .innerJoin(products, eq(variants.productId, products.id))
        .where(
          and(
            sql`${variants.stock} < ${LOW_STOCK_THRESHOLD}`,
            eq(products.status, "active")
          )
        )
        .orderBy(asc(variants.stock))
        .limit(5),

      // Query 4: Subscription MRR
      db.execute(sql`
        SELECT
          COALESCE(SUM(CASE
            WHEN ${subscriptionPlans.interval} = 'monthly' THEN ${subscriptionPlans.price}
            WHEN ${subscriptionPlans.interval} = 'quarterly' THEN ${subscriptionPlans.price} / 3
            WHEN ${subscriptionPlans.interval} = 'yearly' THEN ${subscriptionPlans.price} / 12
            ELSE 0
          END), 0)::int as mrr,
          COUNT(*)::int as active_count
        FROM ${userSubscriptions}
        JOIN ${subscriptionPlans} ON ${userSubscriptions.planId} = ${subscriptionPlans.id}
        WHERE ${userSubscriptions.status} = 'active'
      `),

      // Query 5: Pending fulfillment
      db
        .select({
          id: orders.id,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(inArray(orders.status, ["paid", "pending"]))
        .orderBy(asc(orders.createdAt))
        .limit(5),
    ]);

  // ─── Derived Metrics ───────────────────────────────
  const trends = revenueTrends[0] as {
    today: number;
    yesterday: number;
    this_week: number;
    last_week: number;
    this_month: number;
    last_month: number;
    today_orders: number;
    yesterday_orders: number;
  };

  const aov =
    trends.today_orders > 0
      ? Math.round(trends.today / trends.today_orders)
      : 0;

  const mrr = (subscriptionMetrics[0] as { mrr: number; active_count: number }).mrr;
  const activeSubCount = (subscriptionMetrics[0] as { mrr: number; active_count: number }).active_count;

  // Weekly revenue for chart (this week only — fill missing days with 0)
  const weeklyRaw = await db.execute(sql`
    SELECT
      EXTRACT(DOW FROM ${orders.createdAt})::int as day_of_week,
      COALESCE(SUM(${orders.total}), 0)::int as revenue
    FROM ${orders}
    WHERE ${orders.createdAt} >= ${startOfWeek}
      AND ${orders.status} != 'cancelled'
    GROUP BY EXTRACT(DOW FROM ${orders.createdAt})
  `);
  const weeklyMap = new Map<number, number>();
  for (const row of weeklyRaw as unknown as Array<{ day_of_week: number; revenue: number }>) {
    // JS Sunday=0, DOW Sunday=0 — shift to Monday-first (Mon=0..Sun=6)
    const jsDay = row.day_of_week === 0 ? 6 : row.day_of_week - 1;
    weeklyMap.set(jsDay, row.revenue);
  }
  const dailyRevenue = Array.from({ length: 7 }, (_, i) => weeklyMap.get(i) ?? 0);

  // Recent orders
  const recentOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(5);

  // ─── Status colors ─────────────────────────────────
  const statusColors: Record<string, string> = {
    pending: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    shipped: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    delivered: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <div>
      {/* Welcome banner */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-[-0.03em]">
          Hola, {session?.user?.name?.split(" ")[0] || "Admin"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen de tu tienda hoy
        </p>
      </div>

      {/* ── Revenue Hero + Stat Row ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        {/* Revenue Hero Card — 2/3 on desktop */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-border/50 bg-card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground font-medium">
              Ingresos de hoy
            </span>
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="size-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-[-0.03em] mb-3">
            {formatPrice(trends.today)}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <TrendBadge current={trends.today} previous={trends.yesterday} label="ayer" />
            <TrendBadge current={trends.this_week} previous={trends.last_week} label="semana pasada" />
            <TrendBadge current={trends.this_month} previous={trends.last_month} label="mes pasado" />
          </div>
        </div>

        {/* Stat column — AOV + Orders Today */}
        <div className="flex flex-col gap-3">
          <Link
            href="/admin/orders"
            className="group p-4 rounded-xl border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all border-l-4 border-l-violet-500"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                Ticket promedio
              </span>
              <div className="size-7 rounded-md bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="size-3.5 text-violet-500" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-[-0.03em]">{formatPrice(aov)}</p>
          </Link>
          <Link
            href="/admin/orders"
            className="group p-4 rounded-xl border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all border-l-4 border-l-blue-500"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                Órdenes hoy
              </span>
              <div className="size-7 rounded-md bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="size-3.5 text-blue-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold tracking-[-0.03em]">
                {trends.today_orders}
              </p>
              <TrendBadge
                current={trends.today_orders}
                previous={trends.yesterday_orders}
                label="ayer"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* ── Weekly Revenue Bar Chart ────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">Ingresos de la semana</h2>
        <WeeklyBarChart dailyRevenue={dailyRevenue} />
      </div>

      {/* ── Pending Fulfillment + Low Stock ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
        {/* Pending Fulfillment */}
        <div className="rounded-xl border border-border/50 bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <h2 className="text-sm font-semibold">Pendiente de envío</h2>
            <div className="size-7 rounded-md bg-orange-500/10 flex items-center justify-center">
              <Clock className="size-3.5 text-orange-500" />
            </div>
          </div>
          {pendingOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Sin órdenes pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {pendingOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        statusColors[order.status] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-border/50 bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <h2 className="text-sm font-semibold">Stock bajo</h2>
            <div className="size-7 rounded-md bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="size-3.5 text-rose-500" />
            </div>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Todo con stock suficiente</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {lowStockItems.map((item) => (
                <LowStockRow key={item.variantName} variant={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Top Products Table ──────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card mb-6">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h2 className="text-sm font-semibold">Top productos del mes</h2>
          <div className="size-7 rounded-md bg-amber-500/10 flex items-center justify-center">
            <Package className="size-3.5 text-amber-500" />
          </div>
        </div>
        {topProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Sin ventas este mes</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {topProducts.map((product, i) => (
              <TopProductRow key={product.name} product={product} rank={i + 1} />
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Actions + Recent Orders ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Quick Actions */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Acciones rápidas</h2>
          <div className="flex flex-col gap-2">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-2 p-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors"
            >
              <Zap className="size-4 text-amber-500" />
              Crear producto
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 p-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors"
            >
              <ShoppingCart className="size-4 text-blue-500" />
              Gestionar órdenes
            </Link>
            <Link
              href="/admin/discounts"
              className="flex items-center gap-2 p-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors"
            >
              <CreditCard className="size-4 text-violet-500" />
              Gestionar descuentos
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <h2 className="text-sm font-semibold">Órdenes recientes</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Sin órdenes aún</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        statusColors[order.status] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscription MRR — subtle footer metric */}
      {activeSubCount > 0 && (
        <div className="mt-6 p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3">
          <div className="size-7 rounded-md bg-cyan-500/10 flex items-center justify-center">
            <CreditCard className="size-3.5 text-cyan-500" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">MRR suscripciones</span>
            <span className="text-sm font-bold ml-2">{formatPrice(mrr)}</span>
            <span className="text-xs text-muted-foreground ml-2">
              ({activeSubCount} activas)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
