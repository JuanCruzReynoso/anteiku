/**
 * Email service — ready to wire once RESEND_API_KEY is available.
 *
 * TODO: Install `resend` package and uncomment the send logic below.
 * import { Resend } from "resend";
 */

// const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Types ──────────────────────────────────────────────

export interface OrderEmailData {
  orderId: string;
  email: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  total: number;
}

// ─── Send Order Confirmation ────────────────────────────

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not configured — skipping order confirmation email.");
    return;
  }

  try {
    // TODO: Uncomment when Resend is installed
    // await resend.emails.send({
    //   from: "Anteiku <noreply@anteiku.com>",
    //   to: data.email,
    //   subject: `Pedido #${data.orderId.slice(0, 8).toUpperCase()} confirmado`,
    //   html: buildOrderHtml(data),
    // });

    console.log(`[email] Order confirmation sent to ${data.email} for order ${data.orderId}`);
  } catch (error) {
    // Never block order creation on email failure
    console.error("[email] Failed to send order confirmation:", error);
  }
}

// ─── HTML Builder ───────────────────────────────────────

function buildOrderHtml(data: OrderEmailData): string {
  const itemList = data.items
    .map((item) => `<li>${item.name} x${item.quantity} — $${item.unitPrice.toLocaleString("es-AR")}</li>`)
    .join("");

  return `
    <h1>¡Gracias por tu compra!</h1>
    <p>Tu pedido <strong>#${data.orderId.slice(0, 8).toUpperCase()}</strong> fue confirmado.</p>
    <h2>Resumen</h2>
    <ul>${itemList}</ul>
    <p><strong>Total: $${data.total.toLocaleString("es-AR")}</strong></p>
  `;
}
