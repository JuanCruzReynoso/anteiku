import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/ui/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta de Anteiku y accedé a ofertas exclusivas.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
