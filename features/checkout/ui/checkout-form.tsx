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
      <div className="text-center py-24">
        <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-8">
          Agregá productos antes de finalizar la compra.
        </p>
        <a
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === "shipping" ? (
            <ShippingForm onSubmit={handleShippingSubmit} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Pago</h2>
                <button
                  type="button"
                  onClick={() => setStep("shipping")}
                  className="text-sm text-primary hover:underline"
                >
                  Editar envío
                </button>
              </div>

              {/* Shipping summary */}
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">Enviar a:</p>
                <p className="text-sm text-muted-foreground">
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

              {/* MercadoPago placeholder */}
              <div className="rounded-lg border-2 border-dashed p-8 text-center space-y-4">
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
                className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Completar pedido (Demo)
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border p-6">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
