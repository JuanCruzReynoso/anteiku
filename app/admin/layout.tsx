import { requireAdmin } from "@/features/admin/lib/actions";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/50 min-h-screen p-4 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Anteiku</p>
          </div>
          <nav className="space-y-1 flex-1">
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Productos
            </Link>
            <Link
              href="/admin/categories"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Categorías
            </Link>
            <Link
              href="/admin/orders"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Ordenes
            </Link>
            <Link
              href="/admin/customers"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Clientes
            </Link>
            <Link
              href="/admin/shipping"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Envíos
            </Link>
            <Link
              href="/admin/discounts"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Descuentos
            </Link>
            <Link
              href="/admin/coupons"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Cupones
            </Link>
            <Link
              href="/admin/subscriptions"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Suscripciones
            </Link>
          </nav>
          <div className="pt-6 border-t">
            <Link
              href="/shop"
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Volver a la tienda
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
