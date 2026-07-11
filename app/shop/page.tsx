import type { Metadata } from "next";
import Link from "next/link";
import { mockProducts } from "@/features/product/lib/mock-data";
import { allCategories } from "@/features/product/lib/categories";
import { ProductCard } from "@/features/product/ui/product-card";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Explorá nuestra colección de merchandise geek y café de especialidad.",
  alternates: {
    canonical: "https://anteiku.com/shop",
  },
};

const filterTabs = [
  { label: "Todos", value: "all" },
  ...allCategories.map((c) => ({ label: c.label, value: c.value })),
];

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeCategory = params.category ?? "all";

  const filtered =
    activeCategory === "all"
      ? mockProducts
      : mockProducts.filter((p) => p.category === activeCategory);

  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Colección
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
          Tienda
        </h1>
        <p className="text-muted-foreground mt-3">
          {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-16">
        {filterTabs.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <Link
              key={cat.value}
              href={
                cat.value === "all" ? "/shop" : `/shop?category=${cat.value}`
              }
              className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 text-muted-foreground">
          <p>No hay productos en esta categoría.</p>
        </div>
      )}
    </div>
  );
}
