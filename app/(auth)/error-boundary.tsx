"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, Suspense } from "react";
import { toast } from "sonner";

function LoginErrorCheck() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      toast.error("Error al iniciar sesión", {
        description: "Hubo un problema con el proveedor. Intentá de nuevo.",
      });
    }
  }, [error]);

  return null;
}

export default function ErrorBoundary() {
  return (
    <Suspense fallback={null}>
      <LoginErrorCheck />
    </Suspense>
  );
}
