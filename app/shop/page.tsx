import type { Metadata } from "next";
import Link from "next/link";
import {
  mockProducts,
  type ProductCategory,
} from "@/features/product/lib/mock-data";
import { ProductCard } from "@/features/product/ui/product-card";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Explorá nuestra colección de merchandise geek y café de especialidad.",
};

const categories: { label: string; value: ProductCategory | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Café", value: "coffee" },
  { label: "Figuras", value: "figures" },
  { label: "Indumentaria", value: "apparel" },
  { label: "Stickers", value: "stickers" },
  { label: "Tamagotchis", value: "tamagotchis" },
  { label: "Accesorios", value: "accessories" },
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
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tienda</h1>
        <p className="text-muted-foreground mt-1">
          {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <Link
              key={cat.value}
              href={
                cat.value === "all" ? "/shop" : `/shop?category=${cat.value}`
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-muted-foreground">
          <p>No hay productos en esta categoría.</p>
        </div>
      )}
    </div>
  );
}
