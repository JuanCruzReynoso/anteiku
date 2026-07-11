import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartButton } from "@/features/cart/ui/cart-button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Logo variant="color" size={44} priority />

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/shop"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Tienda
          </Link>
          <Link
            href="/shop?category=coffee"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Café
          </Link>
          <Link
            href="/shop?category=figures"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Figuras
          </Link>
          <Link
            href="/shop?category=apparel"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Indumentaria
          </Link>
          <Link
            href="/shop?category=notebooks"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cuadernos
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle />
          <CartButton />
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors md:hidden"
            aria-label="Menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
