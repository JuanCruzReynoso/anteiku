import { auth } from "@/auth";
import { db } from "@/db";
import { orders, orderItems, variants, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";

export default async function AccountOrdersPage() {
  const session = await auth();

  const userOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, session!.user!.id!))
    .orderBy(desc(orders.createdAt));

  const ordersWithItems = await Promise.all(
    userOrders.map(async (order) => {
      const items = await db
        .select({
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          productName: products.name,
          variantName: variants.name,
        })
        .from(orderItems)
        .innerJoin(variants, eq(orderItems.variantId, variants.id))
        .innerJoin(products, eq(variants.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    })
  );

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  if (ordersWithItems.length === 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold">Pedidos</h2>
        <div className="bg-muted p-10 text-center">
          <p className="text-muted-foreground">
            No tenés pedidos todavía.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Pedidos</h2>

      <div className="space-y-6">
        {ordersWithItems.map((order) => (
          <div key={order.id} className="bg-muted p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Sin fecha"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  #{order.id.slice(0, 8)}
                </p>
              </div>
              <span className="text-xs font-medium bg-foreground text-background px-3 py-1">
                {statusLabels[order.status] || order.status}
              </span>
            </div>

            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.productName} ({item.variantName}) x{item.quantity}
                  </span>
                  <span className="tabular-nums">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border/50 flex justify-between font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
