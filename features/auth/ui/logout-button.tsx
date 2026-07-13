"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  variant?: "ghost" | "outline" | "default" | "destructive";
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  variant = "ghost",
  className,
  showIcon = true,
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await signOut({ callbackUrl: "/login" });
      toast.success("Cerraste sesión correctamente");
    } catch {
      toast.error("Error al cerrar sesión", {
        description: "Intentá de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size="sm"
      className={className}
      disabled={loading}
      onClick={handleLogout}
    >
      {showIcon && <LogOut className="size-4" />}
      Cerrar sesión
    </Button>
  );
}
