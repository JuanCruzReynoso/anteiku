/**
 * Order confirmation email template — ready to wire with React Email.
 *
 * TODO: Install `@react-email/components` and `react-email` packages.
 * This template is a placeholder for when the email system is fully configured.
 */

export interface OrderConfirmationProps {
  orderId: string;
  customerName: string;
  items: Array<{
    name: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export function OrderConfirmationEmail({
  orderId,
  customerName,
  items,
  total,
  shippingAddress,
}: OrderConfirmationProps) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pedido confirmado</title>
    </head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="font-size: 24px; margin-bottom: 16px;">
        ¡Gracias por tu compra, ${customerName}!
      </h1>

      <p style="color: #666; margin-bottom: 24px;">
        Tu pedido <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> fue confirmado.
      </p>

      <h2 style="font-size: 16px; margin-bottom: 8px;">Resumen del pedido</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 1px solid #eee;">
            <th style="text-align: left; padding: 8px 0;">Producto</th>
            <th style="text-align: center; padding: 8px 0;">Cant.</th>
            <th style="text-align: right; padding: 8px 0;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">
                ${item.name}
                <br><small style="color: #999;">${item.variantName}</small>
              </td>
              <td style="text-align: center; padding: 8px 0;">${item.quantity}</td>
              <td style="text-align: right; padding: 8px 0;">
                $${(item.unitPrice * item.quantity).toLocaleString("es-AR")}
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <p style="font-size: 18px; font-weight: bold; text-align: right; margin-bottom: 24px;">
        Total: $${total.toLocaleString("es-AR")}
      </p>

      <h2 style="font-size: 16px; margin-bottom: 8px;">Dirección de envío</h2>
      <p style="color: #666;">
        ${shippingAddress.name}<br>
        ${shippingAddress.line1}<br>
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
        ${shippingAddress.country}
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        Anteiku — Café de especialidad & merchandise
      </p>
    </body>
    </html>
  `;
}
