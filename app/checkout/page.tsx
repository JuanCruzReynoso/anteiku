import type { Metadata } from "next";
import { CheckoutForm } from "@/features/checkout/ui/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order.",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
