"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[global-error]", error);

  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
          <h1 className="text-2xl font-bold">Algo salió mal</h1>
          <p className="text-muted-foreground">
            Ocurrió un error inesperado. Por favor, intentá de nuevo.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-foreground px-6 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
