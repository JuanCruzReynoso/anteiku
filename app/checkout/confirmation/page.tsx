"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useCartStore } from "@/features/cart/lib/cart-store";

export default function ConfirmationPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear cart on mount (order placed)
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Pedido confirmado</h1>

        <p className="text-muted-foreground leading-relaxed">
          ¡Gracias por tu compra! Te vamos a enviar un email de confirmación
          con los detalles del envío.
        </p>

        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          <p>
            Número de pedido:{" "}
            <span className="font-mono font-medium text-foreground">
              #ANT-{Math.random().toString(36).substring(2, 8).toUpperCase()}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-sm font-medium hover:bg-muted transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
