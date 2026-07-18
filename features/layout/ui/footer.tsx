import Link from "next/link";
import Image from "next/image";
import { Mail, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/40">
      <div className="container mx-auto px-6 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <section className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo-mono.png"
                alt="Anteiku"
                width={48}
                height={48}
              />
              <span className="text-sm uppercase tracking-[0.3em] font-bold">
                ANTEIKU
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Merchandise geek premium y café de especialidad.
            </p>
          </section>

          {/* Tienda */}
          <nav aria-label="Tienda" className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
              Tienda
            </h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Todos los productos
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contacto */}
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
              Contacto
            </h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:antieku.store@gmail.com"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  antieku.store@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/anteiku.c0ffee/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  Instagram
                </a>
              </li>
            </ul>
          </section>

          {/* Legal */}
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
              Legal
            </h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </section>
        </div>

        {/* Bottom */}
        <div className="mt-20 pt-8">
          <p className="text-xs text-muted-foreground text-center tracking-wider">
            © {new Date().getFullYear()} Anteiku. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
