"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/features/layout/ui/navbar";
import { Footer } from "@/features/layout/ui/footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
