import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <section className="space-y-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              ANTEIKU
            </Link>
            <p className="text-sm text-muted-foreground">
              Merchandise geek premium y café de especialidad.
            </p>
          </section>

          {/* Tienda */}
          <nav aria-label="Tienda" className="space-y-4">
            <h2 className="text-sm font-semibold">Tienda</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=coffee"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Café
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=figures"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Figuras
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=apparel"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Indumentaria
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=notebooks"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cuadernos
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contacto */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold">Contacto</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hola@anteiku.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  hola@anteiku.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/anteiku"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </section>

          {/* Legal */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold">Legal</h2>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground/50">
                  Política de privacidad
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground/50">
                  Términos y condiciones
                </span>
              </li>
            </ul>
          </section>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Anteiku. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
