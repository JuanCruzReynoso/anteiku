import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Navbar } from "@/features/layout/ui/navbar";
import { Footer } from "@/features/layout/ui/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://anteiku.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Anteiku — Merchandise Geek & Café de Especialidad",
    template: "%s | Anteiku",
  },
  description:
    "Colección curada de tamagotchis, figuras, stickers, indumentaria y café de especialidad. Estética minimalista premium con cultura callejera japonesa.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Anteiku",
    title: "Anteiku — Merchandise Geek & Café de Especialidad",
    description:
      "Colección curada de tamagotchis, figuras, stickers, indumentaria y café de especialidad. Estética minimalista premium con cultura callejera japonesa.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Anteiku — Merchandise Geek & Café de Especialidad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anteiku — Merchandise Geek & Café de Especialidad",
    description:
      "Colección curada de tamagotchis, figuras, stickers, indumentaria y café de especialidad.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#b91c1c" },
    { media: "(prefers-color-scheme: dark)", color: "#dc2626" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-background focus:text-foreground">
            Saltar al contenido
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--background)",
                border: "1px solid var(--muted)",
                color: "var(--foreground)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
