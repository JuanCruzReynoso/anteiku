import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/features/product/lib/queries";
import { getProductDisplayData } from "@/features/product/lib/display";
import { getLowestDiscountedPrice } from "@/features/product/lib/discount";
import { formatPrice } from "@/lib/utils";
import { ProductActions } from "./product-actions";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  const { minPrice, hasRealImage } = getProductDisplayData(product);

  return {
    title: product.name,
    description: product.description ?? undefined,
    alternates: {
      canonical: `${siteUrl}/product/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      url: `${siteUrl}/product/${product.slug}`,
      type: "website",
      images: hasRealImage
        ? [{ url: product.images[0], width: 800, height: 800, alt: product.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description ?? undefined,
      images: hasRealImage ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const { minPrice, hasVariants, hasRealImage } = getProductDisplayData(product);
  const discounted = getLowestDiscountedPrice(product.variants, product.discounts ?? []);

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
      lowPrice: minPrice,
      highPrice: Math.max(...product.variants.map((v) => v.price)),
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
            <li><Link href="/" className="hover:text-foreground transition-colors">Inicio</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/shop" className="hover:text-foreground transition-colors">Tienda</Link></li>
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
                {product.category?.name ?? "Producto"}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                {product.category?.name ?? ""}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-4">
                {discounted ? (
                  <>
                    <p className="text-2xl font-semibold text-destructive">
                      {formatPrice(discounted.discountedPrice)}
                    </p>
                    <p className="text-lg text-muted-foreground line-through">
                      {formatPrice(discounted.originalPrice)}
                    </p>
                    <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                      {discounted.discount.type === "percentage"
                        ? `-${discounted.discount.value}%`
                        : `-${formatPrice(discounted.discount.value)}`}
                    </span>
                  </>
                ) : (
                  <p className="text-2xl font-semibold">
                    {hasVariants ? "Desde " : ""}
                    {formatPrice(minPrice)}
                  </p>
                )}
              </div>
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
