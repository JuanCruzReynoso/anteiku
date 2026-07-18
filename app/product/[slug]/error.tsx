"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

const log = logger.create("product");

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error(error.message, { digest: error.digest });
  }, [error]);

  return (
    <div className="container mx-auto px-6 md:px-8 py-32 text-center">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Producto no encontrado</h1>
          <p className="text-muted-foreground">
            No pudimos cargar este producto.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={reset}>
            Reintentar
          </Button>
          <Link href="/shop" className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium hover:bg-muted transition-colors">
            Tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
