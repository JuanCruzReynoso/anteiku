"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/features/cart/lib/cart-store";
import { ShippingForm } from "@/features/checkout/ui/shipping-form";
import { OrderSummary } from "@/features/checkout/ui/order-summary";
import { createOrder } from "@/features/checkout/lib/actions";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import type { ShippingFormData } from "@/features/checkout/lib/schema";

interface CouponDiscount {
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  code: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(
    null
  );
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDiscount | null>(
    null
  );

  // Redirect if cart is empty
  if (items.length === 0 && !shippingData) {
    return (
      <div className="text-center py-32 animate-fade-in">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Sin productos</h1>
            <p className="text-muted-foreground">
              Agregá algo al carrito antes de continuar.
            </p>
          </div>
          <a
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-10 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Ver productos
          </a>
        </div>
      </div>
    );
  }

  function handleShippingSubmit(data: ShippingFormData & { shippingMethodId: string }) {
    const { shippingMethodId: methodId, ...address } = data;
    setShippingData(address);
    setShippingMethodId(methodId);
    setStep("payment");
  }

  // TODO: MercadoPago Integration
  // 1. Initialize MercadoPago SDK with public key
  // 2. Create payment preference via API route
  // 3. Redirect to MercadoPago checkout
  // 4. Handle webhook callback for payment confirmation
  // 5. Create order in DB after payment approval
  async function handlePayment() {
    if (!shippingData || !shippingMethodId) return;
    setIsProcessing(true);

    try {
      const result = await createOrder({
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: shippingData,
        email: shippingData.email,
        couponCode: appliedCoupon?.code,
        shippingMethodId,
      });

      if (result.error) {
        toast.error("Error al procesar el pedido", {
          description: result.error,
        });
        return;
      }

      toast.success("Pedido confirmado", {
        description: "Redirigiendo a la confirmación...",
      });
      clearCart();
      router.push(`/checkout/confirmation?orderId=${result.orderId}`);
    } catch {
      toast.error("Error inesperado", {
        description: "Intentá nuevamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
      <BackButton href="/shop" />
      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-12" role="group" aria-label="Pasos del checkout">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
              step === "shipping" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
            }`}
            aria-current={step === "shipping" ? "step" : undefined}
          >
            1
          </span>
          <span className={`text-sm font-medium ${step === "shipping" ? "text-foreground" : "text-muted-foreground"}`}>
            Envío
          </span>
        </div>
        <div className="flex-1 h-px bg-muted" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
              step === "payment" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
            }`}
            aria-current={step === "payment" ? "step" : undefined}
          >
            2
          </span>
          <span className={`text-sm font-medium ${step === "payment" ? "text-foreground" : "text-muted-foreground"}`}>
            Pago
          </span>
        </div>
      </div>

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
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("shipping")}
                  className="text-xs uppercase tracking-[0.15em]"
                >
                  Editar envío
                </Button>
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
                <div className="w-12 h-12 mx-auto bg-muted-foreground/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <p className="text-muted-foreground">
                  Integración con MercadoPago próximamente.
                </p>
                <p className="text-xs text-muted-foreground">
                  Por ahora, es un checkout de demostración.
                </p>
              </div>

              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
                aria-busy={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Procesando..." : "Completar pedido (Demo)"}
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-muted p-6">
            <OrderSummary
              appliedCoupon={appliedCoupon}
              onCouponApplied={setAppliedCoupon}
              onCouponRemoved={() => setAppliedCoupon(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
