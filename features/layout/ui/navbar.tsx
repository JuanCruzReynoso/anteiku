"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartButton } from "@/features/cart/ui/cart-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [{ href: "/shop", label: "Tienda" }];

const adminRoles = ["owner", "admin"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === "loading";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-18 items-center justify-between px-6 md:px-8">
        {/* Logo */}
        <Logo variant="color" size={48} priority />

        {/* Navigation - Desktop */}
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "?");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors relative ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary" />
                )}
              </Link>
            );
          })}
          {user && adminRoles.includes(user.role as string) && (
            <Link
              href="/admin"
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors relative ${
                pathname.startsWith("/admin")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin
              {pathname.startsWith("/admin") && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary" />
              )}
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <CartButton />

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-20 animate-pulse bg-muted" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground max-w-[120px] truncate">
                  {user.name || user.email?.split("@")[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="accent" size="sm">
                    Crear cuenta
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Abrir menú"
                  className="md:hidden"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" showCloseButton={false}>
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <nav aria-label="Navegación móvil" className="flex flex-col gap-0 px-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "?");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`block py-4 text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {user && adminRoles.includes(user.role as string) && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                    className={`block py-4 text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                      pathname.startsWith("/admin")
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </nav>

              {/* Mobile auth section */}
              <div className="mt-auto px-6 pb-6 space-y-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted">
                      <User className="size-4 text-muted-foreground" />
                      <span className="text-sm truncate">
                        {user.name || user.email?.split("@")[0]}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                    >
                      Cerrar sesión
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="block" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Iniciar sesión
                      </Button>
                    </Link>
                    <Link href="/register" className="block" onClick={() => setOpen(false)}>
                      <Button variant="accent" className="w-full">
                        Crear cuenta
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
