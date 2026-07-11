import Link from "next/link";
import Image from "next/image";
import { mockProducts } from "@/features/product/lib/mock-data";
import { ProductCard } from "@/features/product/ui/product-card";

export default function Home() {
  const featured = mockProducts.slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Anteiku",
    url: "https://anteiku.com",
    logo: "https://anteiku.com/logo-color.png",
    description: "Merchandise geek premium y café de especialidad.",
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Anteiku",
    url: "https://anteiku.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://anteiku.com/shop?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative flex items-center justify-center py-40 md:py-56 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="container relative mx-auto px-6 md:px-8 text-center">
          <div className="space-y-10">
            {/* Logo */}
            <div className="flex justify-center">
              <Image
                src="/logo-color.png"
                alt="Anteiku Coffee"
                width={100}
                height={100}
                priority
              />
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] uppercase">
                ANTEIKU
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed tracking-wide">
                Merchandise geek premium y café de especialidad.
                <br className="hidden md:block" />
                Curado para los exigentes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-10 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Ver todo
              </Link>
              <Link
                href="/shop?category=coffee"
                className="inline-flex h-12 items-center justify-center rounded-full px-10 text-sm font-medium hover:bg-muted transition-colors"
              >
                Explorar café
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────── */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Destacados
              </p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
                Elegidos a mano
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center sm:hidden">
            <Link
              href="/shop"
              className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todos los productos →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lookbook ─────────────────────────────────── */}
      <section className="py-32">
        <div className="container mx-auto px-6 md:px-8">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Lookbook
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Mr. Popo Igor
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Crossover限量 — Edición limitada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <figure className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden group">
              <Image
                src="/products/mrpopo-igor-rosa-lookbook.jpg"
                alt="Modelo usando remera Mr. Popo Igor color rosa en skatepark"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <figcaption className="absolute bottom-0 inset-x-0 p-6">
                <span className="text-white text-xs uppercase tracking-[0.2em] font-medium">
                  Variante Rosa
                </span>
              </figcaption>
            </figure>

            <figure className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden group">
              <Image
                src="/products/mrpopo-igor-negra-lookbook.jpg"
                alt="Modelo usando remera Mr. Popo Igor color negro"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <figcaption className="absolute bottom-0 inset-x-0 p-6">
                <span className="text-white text-xs uppercase tracking-[0.2em] font-medium">
                  Variante Negra
                </span>
              </figcaption>
            </figure>
          </div>

          <div className="mt-12">
            <Link
              href="/product/mrpopo-igor-remera"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-10 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Ver producto
            </Link>
          </div>
        </div>
      </section>

      {/* ── Brand Statement ──────────────────────────── */}
      <section className="py-40">
        <div className="container mx-auto px-6 md:px-8 text-center max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.03em] mb-10">
            No somos una tienda más de merch.
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            No hacemos genérico. Cada pieza está curada con intención — desde
            granos de café de origen único hasta coleccionables seleccionados a
            mano. Si no cumple el estándar, no entra al catálogo.
          </p>
        </div>
      </section>
    </div>
  );
}
