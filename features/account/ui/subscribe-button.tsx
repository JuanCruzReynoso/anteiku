"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { enrollInSubscription } from "@/features/account/lib/subscription-actions";

interface SubscribeButtonProps {
  planId: string;
}

export function SubscribeButton({ planId }: SubscribeButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubscribe() {
    if (!session?.user) {
      toast.error("Tenés que estar logueado para suscribirte", {
        description: "Iniciá sesión para continuar.",
      });
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const result = await enrollInSubscription(planId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Suscripción creada", {
          description: "Redirigiendo a tus suscripciones...",
        });
        router.push("/account/subscriptions");
      }
    } catch {
      toast.error("Error al suscribirse");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
      Suscribirme
    </Button>
  );
}
