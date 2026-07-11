import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockProducts } from "@/features/product/lib/mock-data";
import { ProductActions } from "./product-actions";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);

  if (!product) notFound();

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const hasVariants = product.variants.length > 1;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
          {product.category}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold mt-2">
              {hasVariants ? "Desde " : ""}
              {formatPrice(minPrice)}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Client-side variant selector + add to cart */}
          <ProductActions product={product} />
        </div>
      </div>
    </div>
  );
}
