import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { mockProducts } from "@/features/product/lib/mock-data";
import { ProductActions } from "./product-actions";

const siteUrl = "https://anteiku.com";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) return { title: "Producto no encontrado" };

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const hasRealImage = product.images[0] && !product.images[0].startsWith("/placeholder");

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: `${siteUrl}/product/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      url: `${siteUrl}/product/${product.slug}`,
      type: "website",
      images: hasRealImage
        ? [{ url: product.images[0], width: 800, height: 800, alt: product.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: hasRealImage ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);

  if (!product) notFound();

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const hasVariants = product.variants.length > 1;
  const hasRealImage = product.images[0] && !product.images[0].startsWith("/placeholder");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: hasRealImage ? `${siteUrl}${product.images[0]}` : undefined,
    brand: {
      "@type": "Brand",
      name: "Anteiku",
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: minPrice / 100,
      highPrice: Math.max(...product.variants.map((v) => v.price)) / 100,
      priceCurrency: "ARS",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/product/${product.slug}`,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Tienda", item: `${siteUrl}/shop` },
        { "@type": "ListItem", position: 3, name: product.name },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
        {/* Breadcrumbs — editorial micro text */}
        <nav aria-label="Breadcrumb" className="mb-10 text-xs text-muted-foreground">
          <ol className="flex items-center gap-2 uppercase tracking-[0.15em]">
            <li><a href="/" className="hover:text-foreground transition-colors">Inicio</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="/shop" className="hover:text-foreground transition-colors">Tienda</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {/* Image — borderless, full bleed */}
          <div className="aspect-square bg-muted overflow-hidden relative">
            {hasRealImage ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                {product.category}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                {product.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold mt-4">
                {hasVariants ? "Desde " : ""}
                {formatPrice(minPrice)}
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed text-lg">
              {product.description}
            </p>

            {/* Client-side variant selector + add to cart */}
            <ProductActions product={product} />
          </div>
        </div>
      </div>
    </>
  );
}
