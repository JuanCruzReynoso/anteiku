import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { products, orders, users, variants } from "@/db/schema";
import { count, sql, eq, gte, desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD ?? 5);

export default async function AdminDashboard() {
  const session = await requireAdmin();

  // ─── Queries ───────────────────────────────────────────
  const [productCount] = await db
    .select({ value: count() })
    .from(products);

  const [orderCount] = await db
    .select({ value: count() })
    .from(orders);

  const [customerCount] = await db
    .select({ value: count() })
    .from(users);

  const revenueResult = await db.execute(sql`
    SELECT COALESCE(SUM(${orders.total}), 0)::int as total
    FROM ${orders}
    WHERE ${orders.status} != 'cancelled'
  `);
  const totalRevenue = (revenueResult[0] as { total: number }).total;

  const [pendingOrderCount] = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.status, "pending"));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [recentOrderCount] = await db
    .select({ value: count() })
    .from(orders)
    .where(gte(orders.createdAt, sevenDaysAgo));

  const [lowStockCount] = await db
    .select({ value: count() })
    .from(variants)
    .where(sql`${variants.stock} < ${LOW_STOCK_THRESHOLD}`);

  // Recent orders for activity feed
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

  // ─── Stat cards config ─────────────────────────────────
  const primaryStats = [
    {
      label: "Productos",
      value: productCount.value,
      href: "/admin/products",
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Órdenes",
      value: orderCount.value,
      href: "/admin/orders",
      icon: ShoppingCart,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Clientes",
      value: customerCount.value,
      href: "/admin/customers",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Ingresos",
      value: formatPrice(totalRevenue),
      href: "/admin/orders",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  const secondaryStats = [
    {
      label: "Pendientes",
      value: pendingOrderCount.value,
      href: "/admin/orders?status=pending",
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Últimos 7 días",
      value: recentOrderCount.value,
      href: "/admin/orders",
      icon: TrendingUp,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: `Stock bajo`,
      value: lowStockCount.value,
      href: "/admin/products",
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      suffix: `<${LOW_STOCK_THRESHOLD}`,
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    shipped: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    delivered: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <div className="p-8 max-w-6xl">
      {/* Welcome banner */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-[-0.03em]">
          Hola, {session.user.name?.split(" ")[0] || "Admin"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen de tu tienda hoy
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {primaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group p-4 rounded-xl border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </span>
                <div className={`size-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`size-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-[-0.03em]">
                {stat.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group p-4 rounded-xl border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                  {stat.suffix && (
                    <span className="ml-1.5 text-[10px] text-muted-foreground/60">
                      ({stat.suffix})
                    </span>
                  )}
                </span>
                <div className={`size-7 rounded-md ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`size-3.5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold tracking-[-0.03em]">
                {stat.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-border/50 bg-card">
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
  );
}
