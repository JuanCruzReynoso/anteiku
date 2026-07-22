"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-48 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/login");
  }

  const navItems = [
    { href: "/account", label: "Perfil" },
    { href: "/account/orders", label: "Pedidos" },
    { href: "/account/subscriptions", label: "Suscripciones" },
  ];

  return (
    <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
      <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-12">
        Mi cuenta
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar nav */}
        <nav className="lg:col-span-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-4 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-accent text-foreground font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
