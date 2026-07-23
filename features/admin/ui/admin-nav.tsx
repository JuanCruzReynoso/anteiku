"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
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
import {
  Sidebar,
  SidebarContent as SidebarContentArea,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";

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

export function AdminNav({ userInitial, userName, userRole }: AdminNavProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/shop"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
        >
          <ArrowLeft className="size-3" />
          Volver a la tienda
        </Link>
        <div className="flex items-center gap-3 px-2 py-1">
          <Logo variant="mono" size={32} />
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-base font-bold tracking-[-0.02em]">
              Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Anteiku</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContentArea>
        {navSections.map((section) => (
          <SidebarMenu key={section.label}>
            <p className="px-3 text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-1.5 group-data-[collapsible=icon]:hidden">
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                    render={
                      <Link
                        href={item.href}
                        className="border-l-2 border-transparent data-[active]:border-primary"
                      />
                    }
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        ))}
      </SidebarContentArea>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">
              {userInitial}
            </span>
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground capitalize">
              {userRole}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
