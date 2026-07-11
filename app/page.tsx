import Link from "next/link";
import Image from "next/image";
import { mockProducts } from "@/features/product/lib/mock-data";
import { ProductCard } from "@/features/product/ui/product-card";

const categories = [
  {
    label: "Café",
    value: "coffee",
    emoji: "☕",
    description: "Tostados de especialidad para el culto al buen café",
  },
  {
    label: "Figuras",
    value: "figures",
    emoji: "🎯",
    description: "Coleccionables premium, selección curada",
  },
  {
    label: "Indumentaria",
    value: "apparel",
    emoji: "👕",
    description: "Streetwear que mezcla cultura anime y moda",
  },
] as const;

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
      <section className="relative flex items-center justify-center py-32 md:py-40 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="container relative mx-auto px-4 text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logo-color.png"
              alt="Anteiku Coffee"
              width={120}
              height={120}
              priority
              className="rounded-full"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              ANTEIKU
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Merchandise geek premium y café de especialidad.
              <br className="hidden md:block" />
              Curado para los exigentes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ver todo
            </Link>
            <Link
              href="/shop?category=coffee"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-sm font-medium hover:bg-muted transition-colors"
            >
              Explorar café
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Explorá por categoría
            </h2>
            <p className="text-muted-foreground mt-2">
              ¿Qué estás buscando?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                href={`/shop?category=${cat.value}`}
                className="group relative aspect-[4/3] bg-muted rounded-xl overflow-hidden flex flex-col items-center justify-center gap-4 transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <span className="text-6xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </span>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────── */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Productos destacados
              </h2>
              <p className="text-muted-foreground mt-1">
                Elegidos a mano
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-medium text-primary hover:underline hidden sm:block"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/shop"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todos los productos →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Brand Statement ──────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            No somos una tienda más de merch.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            No hacemos genérico. Cada pieza está curada con intención — desde
            granos de café de origen único hasta coleccionables seleccionados a
            mano. Si no cumple el estándar, no entra al catálogo.
          </p>
        </div>
      </section>
    </div>
  );
}
