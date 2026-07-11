"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/lib/cart-store";
import { ShippingForm } from "@/features/checkout/ui/shipping-form";
import { OrderSummary } from "@/features/checkout/ui/order-summary";
import type { ShippingFormData } from "@/features/checkout/lib/schema";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(
    null
  );

  // Redirect if cart is empty
  if (items.length === 0 && !shippingData) {
    return (
      <div className="text-center py-32">
        <h1 className="text-4xl font-bold tracking-[-0.03em] mb-4">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-10">
          Agregá productos antes de finalizar la compra.
        </p>
        <a
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-10 text-sm font-medium text-background hover:bg-foreground/80 transition-colors"
        >
          Ver productos
        </a>
      </div>
    );
  }

  function handleShippingSubmit(data: ShippingFormData) {
    setShippingData(data);
    setStep("payment");
  }

  function handlePayment() {
    // Placeholder — integración con MercadoPago
    router.push("/checkout/confirmation");
  }

  return (
    <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
      <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === "shipping" ? (
            <ShippingForm onSubmit={handleShippingSubmit} />
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Pago</h2>
                <button
                  type="button"
                  onClick={() => setStep("shipping")}
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Editar envío
                </button>
              </div>

              {/* Shipping summary — borderless */}
              <div className="bg-muted p-6 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
                  Enviar a:
                </p>
                <p className="text-sm">
                  {shippingData?.name}
                  <br />
                  {shippingData?.line1}
                  {shippingData?.line2 && <>, {shippingData.line2}</>}
                  <br />
                  {shippingData?.city}, {shippingData?.state}{" "}
                  {shippingData?.postalCode}
                  <br />
                  {shippingData?.country}
                </p>
              </div>

              {/* MercadoPago placeholder — borderless */}
              <div className="bg-muted p-10 text-center space-y-4">
                <div className="text-4xl">💳</div>
                <p className="text-muted-foreground">
                  Acá va a aparecer la integración con MercadoPago.
                </p>
                <p className="text-xs text-muted-foreground">
                  Por ahora, es un checkout de demostración.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                className="w-full h-12 rounded-full bg-foreground text-background font-medium hover:bg-foreground/80 transition-colors"
              >
                Completar pedido (Demo)
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-muted p-6">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
