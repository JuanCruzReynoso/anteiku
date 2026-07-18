"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

const log = logger.create("terms");

export default function TermsError({
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">
            Ocurrió un error al cargar esta página. Intentá de nuevo.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={reset}>
            Reintentar
          </Button>
          <Link href="/" className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium hover:bg-muted transition-colors">
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
