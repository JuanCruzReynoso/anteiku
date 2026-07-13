import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/ui/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Iniciá sesión en tu cuenta de Anteiku.",
};

export default function LoginPage() {
  return <LoginForm />;
}
