import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { products, orders, users } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireAdmin();

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/admin/products"
          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <h3 className="text-sm font-medium text-muted-foreground">
            Productos
          </h3>
          <p className="text-2xl font-bold">{productCount.value}</p>
        </Link>
        <Link
          href="/admin/orders"
          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <h3 className="text-sm font-medium text-muted-foreground">
            Ordenes
          </h3>
          <p className="text-2xl font-bold">{orderCount.value}</p>
        </Link>
        <Link
          href="/admin/customers"
          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <h3 className="text-sm font-medium text-muted-foreground">
            Clientes
          </h3>
          <p className="text-2xl font-bold">{customerCount.value}</p>
        </Link>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ingresos
          </h3>
          <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Bienvenido, {session.user.name || session.user.email}
        </h2>
        <p className="text-muted-foreground">
          Este es tu panel de administracion. Desde aqui podes gestionar
          productos, ordenes y clientes.
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            Tu rol: <span className="capitalize">{session.user.role}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Roles disponibles: owner (acceso total), admin (gestion), customer
            (compras)
          </p>
        </div>
      </div>
    </div>
  );
}
