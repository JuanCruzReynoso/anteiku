import { requireAdmin } from "@/features/admin/lib/actions";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Truck,
  Tag,
  Percent,
  CreditCard,
  ArrowLeft,
} from "lucide-react";

const navSections = [
  {
    label: "General",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/products", label: "Productos", icon: Package },
      { href: "/admin/categories", label: "Categorías", icon: FolderTree },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { href: "/admin/orders", label: "Órdenes", icon: ShoppingCart },
      { href: "/admin/customers", label: "Clientes", icon: Users },
      { href: "/admin/shipping", label: "Envíos", icon: Truck },
    ],
  },
  {
    label: "Promociones",
    items: [
      { href: "/admin/discounts", label: "Descuentos", icon: Tag },
      { href: "/admin/coupons", label: "Cupones", icon: Percent },
      { href: "/admin/subscriptions", label: "Suscripciones", icon: CreditCard },
    ],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-muted/30 flex flex-col">
        {/* Brand */}
        <div className="p-5 border-b border-border/50">
          <Link href="/shop" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3" />
            Volver a la tienda
          </Link>
          <h1 className="text-base font-bold tracking-[-0.02em] mt-3">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Anteiku</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {(session.user.name || session.user.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name || session.user.email?.split("@")[0]}
              </p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground capitalize">
                {session.user.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
