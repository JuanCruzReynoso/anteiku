import { z } from "zod";

export const shippingSchema = z.object({
  email: z.string().email("Ingresá un email válido"),
  name: z.string().min(2, "El nombre es obligatorio"),
  line1: z.string().min(5, "La dirección es obligatoria"),
  line2: z.string().optional(),
  city: z.string().min(2, "La ciudad es obligatoria"),
  state: z.string().min(2, "La provincia es obligatoria"),
  postalCode: z.string().min(3, "El código postal es obligatorio"),
  country: z.string().min(2, "El país es obligatorio"),
  phone: z.string().min(8, "El teléfono es obligatorio"),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

// ─── Order Schema ────────────────────────────────────────

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "El carrito está vacío"),
  shippingAddress: shippingSchema,
  email: z.string().email("Ingresá un email válido"),
  couponCode: z.string().optional(),
  shippingMethodId: z.string().uuid("Elegí un método de envío"),
});

export type OrderInput = z.infer<typeof orderSchema>;
