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
    <div className="container mx-auto px-6 md:px-8 py-32 text-center">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex justify-center">
          <CheckCircle className="h-14 w-14 text-primary" />
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Pedido
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
            Confirmado
          </h1>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          ¡Gracias por tu compra! Te vamos a enviar un email de confirmación
          con los detalles del envío.
        </p>

        <div className="bg-muted p-4 text-sm">
          <p>
            Número de pedido:{" "}
            <span className="font-mono font-medium text-foreground">
              #ANT-{Date.now().toString(36).toUpperCase()}-{Math.random().toString(36).substring(2, 5).toUpperCase()}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-10 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full px-10 text-sm font-medium hover:bg-muted transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
