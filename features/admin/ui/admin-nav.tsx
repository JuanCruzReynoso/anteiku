"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  Menu,
} from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface AdminNavProps {
  userInitial: string;
  userName: string;
  userRole: string;
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      <div className="p-5 border-b border-border/50">
        <Link href="/shop" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" />
          Volver a la tienda
        </Link>
        <h1 className="text-base font-bold tracking-[-0.02em] mt-3">Admin Panel</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Anteiku</p>
      </div>

      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                      isActive
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
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
    </>
  );
}

export function AdminNav({ userInitial, userName, userRole }: AdminNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile hamburger — fixed top-left */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon-sm" />}>
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-full p-0 bg-background/95 backdrop-blur-sm">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de administración</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full">
              <SidebarContent pathname={pathname} />
              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{userInitial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground capitalize">{userRole}</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-64 border-r border-border/50 bg-muted/30 flex-col shrink-0">
        <SidebarContent pathname={pathname} />
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{userInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
