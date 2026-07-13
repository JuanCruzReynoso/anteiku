import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts, getAllCategories } from "@/features/product/lib/queries";
import { searchProducts } from "@/db/queries";
import { ProductCard } from "@/features/product/ui/product-card";
import { SearchInput } from "@/features/shop/ui/search-input";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Explorá nuestra colección de merchandise geek y café de especialidad.",
  alternates: {
    canonical: `${APP_URL}/shop`,
  },
};

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeCategory = params.category ?? "all";
  const searchQuery = params.q ?? "";

  const [allProducts, allCategories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  // Apply search filter if query exists
  const searched = searchQuery
    ? await searchProducts(searchQuery)
    : allProducts;

  // Combine search + category filter
  // searchProducts doesn't include category relation, so we match via categoryId
  const categoryMap = new Map(allCategories.map((c) => [c.id, c.slug]));
  const filtered =
    activeCategory === "all"
      ? searched
      : searched.filter((p) => p.categoryId && categoryMap.get(p.categoryId) === activeCategory);

  const filterTabs = [
    { label: "Todos", value: "all" },
    ...allCategories.map((c) => ({ label: c.name, value: c.slug })),
  ];

  const limitedProducts = filtered.slice(0, 20);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tienda — Anteiku",
    url: `${APP_URL}/shop`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: limitedProducts.length,
      itemListElement: limitedProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${APP_URL}/product/${product.slug}`,
        name: product.name,
      })),
    },
  };

  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          {searchQuery && (
            <> para &ldquo;{searchQuery}&rdquo;</>
          )}
        </p>
      </div>

      {/* Search + Category Filter */}
      <div className="space-y-4 mb-16">
        <div className="max-w-md">
          <SearchInput />
        </div>
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((cat) => {
            const isActive = activeCategory === cat.value;
            const href =
              cat.value === "all"
                ? searchQuery ? `/shop?q=${searchQuery}` : "/shop"
                : searchQuery
                  ? `/shop?category=${cat.value}&q=${searchQuery}`
                  : `/shop?category=${cat.value}`;
            return (
              <Link
                key={cat.value}
                href={href}
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
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} priority={index === 0} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 text-muted-foreground">
          <p>
            {searchQuery
              ? `No se encontraron productos para "${searchQuery}".`
              : "No hay productos en esta categoría."}
          </p>
        </div>
      )}
    </div>
  );
}
