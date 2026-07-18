import { getActiveSubscriptionPlans } from "@/features/account/lib/subscription-actions";
import { formatPrice } from "@/lib/utils";
import { SubscribeButton } from "@/features/account/ui/subscribe-button";

export default async function SubscriptionsPage() {
  const plans = await getActiveSubscriptionPlans();

  return (
    <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
            Suscripciones
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Elegí el plan que mejor se adapte a vos. Accedé a beneficios exclusivos y descuentos especiales.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="bg-muted p-10 text-center">
            <p className="text-muted-foreground">
              No hay planes disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-muted p-6 space-y-4 flex flex-col"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tabular-nums">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{plan.interval === "monthly" ? "mes" : plan.interval === "quarterly" ? "trimestre" : "año"}
                  </span>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-2 flex-1">
                    {(plan.features as string[]).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-foreground mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <SubscribeButton planId={plan.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
