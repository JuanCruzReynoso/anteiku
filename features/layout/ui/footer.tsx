import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              ANTEIKU
            </Link>
            <p className="text-sm text-muted-foreground">
              Merchandise geek premium y café de especialidad.
            </p>
          </div>

          {/* Tienda */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Tienda</h3>
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
            </ul>
          </div>

          {/* Ayuda */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Ayuda</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Envíos
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>
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
