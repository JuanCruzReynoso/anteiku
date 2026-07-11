import type { Metadata } from "next";
import { CheckoutForm } from "@/features/checkout/ui/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalizá tu compra en Anteiku.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
