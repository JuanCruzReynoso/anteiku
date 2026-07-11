import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-32 text-center">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sin resultados</h1>
          <p className="text-muted-foreground">
            El producto que buscás no existe.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-10 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Ver tienda
        </Link>
      </div>
    </div>
  );
}
