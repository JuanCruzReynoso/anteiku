import type { MetadataRoute } from "next";
import { mockProducts } from "@/features/product/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://anteiku.com";

  const staticPages = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/shop?category=coffee`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/shop?category=figures`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/shop?category=apparel`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/shop?category=notebooks`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ];

  const productPages = mockProducts.map((product) => ({
    url: `${base}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
