"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUserSubscriptions,
  type UserSubscription,
} from "@/features/account/lib/subscription-actions";
import { SubscriptionCard } from "@/features/account/ui/subscription-card";

export default function AccountSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadSubscriptions() {
    const subs = await getUserSubscriptions();
    setSubscriptions(subs);
    setIsLoading(false);
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold">Suscripciones</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold">Suscripciones</h2>
        <div className="bg-muted p-10 text-center space-y-4">
          <p className="text-muted-foreground">
            No tenés suscripciones activas.
          </p>
          <Link
            href="/subscriptions"
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Ver planes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Suscripciones</h2>

      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onStatusChange={loadSubscriptions}
          />
        ))}
      </div>
    </div>
  );
}
