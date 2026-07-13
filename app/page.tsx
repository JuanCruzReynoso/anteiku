import { getFeaturedProducts } from "@/features/product/lib/queries";
import { HomeContent } from "@/features/home/ui/home-content";

export default async function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const featured = await getFeaturedProducts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Anteiku",
    url: siteUrl,
    logo: `${siteUrl}/logo-color.png`,
    description: "Merchandise geek premium y café de especialidad.",
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Anteiku",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <HomeContent featured={featured} />
    </>
  );
}
