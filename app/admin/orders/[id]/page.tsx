import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/lib/actions";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { OrderStatusForm } from "./order-status-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: {
        with: {
          variant: {
            with: { product: true },
          },
        },
      },
      payments: true,
      shipmentMethod: true,
    },
  });

  if (!order) {
    notFound();
  }

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  const paymentStatusLabel: Record<string, string> = {
    pending: "Pendiente",
    completed: "Completado",
    failed: "Fallido",
    refunded: "Reembolsado",
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        Orden #{order.id.slice(0, 8)}
      </h1>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Order info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Informacion de la orden
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estado</dt>
              <dd className="font-medium">{statusLabel[order.status] ?? order.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-medium">{formatPrice(order.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fecha</dt>
              <dd>{new Date(order.createdAt).toLocaleDateString("es-AR")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cliente</dt>
              <dd>{order.customerEmail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Método de envío</dt>
              <dd>{order.shipmentMethod?.name ?? "—"}</dd>
            </div>
          </dl>
        </div>

        {/* Shipping address */}
        <div className="border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Direccion de envio
          </h2>
          <div className="text-sm space-y-1">
            <p className="font-medium">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && (
              <p>{order.shippingAddress.line2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      </div>

      {/* Payment info */}
      {order.payments.length > 0 && (
        <div className="border rounded-lg mb-6">
          <div className="p-4 border-b">
            <h2 className="text-sm font-medium text-muted-foreground">
              Pagos ({order.payments.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Método</th>
                <th className="text-left px-4 py-2 font-medium">ID Transacción</th>
                <th className="text-right px-4 py-2 font-medium">Monto</th>
                <th className="text-left px-4 py-2 font-medium">Estado</th>
                <th className="text-left px-4 py-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-2 capitalize">{payment.method}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {payment.transactionId ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatPrice(payment.amount)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : payment.status === "failed"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {paymentStatusLabel[payment.status] ?? payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order items */}
      <div className="border rounded-lg mb-6">
        <div className="p-4 border-b">
          <h2 className="text-sm font-medium text-muted-foreground">
            Items ({order.items.length})
          </h2>
        </div>
        {order.items.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Producto</th>
                <th className="text-left px-4 py-2 font-medium">Variante</th>
                <th className="text-right px-4 py-2 font-medium">Cant.</th>
                <th className="text-right px-4 py-2 font-medium">Precio</th>
                <th className="text-right px-4 py-2 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">{item.variant.product.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {item.variant.name}
                  </td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-4 text-sm text-muted-foreground text-center">
            Sin items
          </p>
        )}
      </div>

      {/* Status update */}
      <OrderStatusForm
        orderId={order.id}
        currentStatus={order.status}
        currentNotes={order.notes ?? ""}
      />
    </div>
  );
}
