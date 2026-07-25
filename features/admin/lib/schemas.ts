import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug solo puede contener minusculas, numeros y guiones"
    ),
  description: z.string().min(1, "La descripcion es requerida"),
  basePrice: z.number().min(0, "El precio debe ser positivo"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  status: z.enum(["active", "inactive", "draft"]),
  featured: z.boolean(),
  images: z.array(z.string()).min(1, "Al menos una imagen es requerida"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug solo puede contener minusculas, numeros y guiones"
    ),
  description: z.string().optional(),
  image: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const variantSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  sku: z.string().min(1, "El SKU es requerido"),
  price: z.number().min(0, "El precio debe ser positivo"),
  stock: z.number().min(0, "El stock debe ser positivo"),
  options: z.record(z.string(), z.string()).optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
  notes: z.string().optional(),
});

export const orderTransitionSchema = z.object({
  fromStatus: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
  toStatus: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});

export const shipmentMethodSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  cost: z.number().min(0, "El costo debe ser positivo"),
  estimatedDays: z.number().min(1, "Los días estimados deben ser al menos 1"),
  active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type ShipmentMethodInput = z.infer<typeof shipmentMethodSchema>;

export const discountSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum(["percentage", "fixed"]),
    value: z.number().min(0, "El valor debe ser positivo"),
    productId: z.string().optional(),
    categoryId: z.string().optional(),
    minPurchase: z.number().optional(),
    startsAt: z.date().optional(),
    endsAt: z.date().optional(),
    active: z.boolean().default(true),
  })
  .refine(
    (data) => !(data.productId && data.categoryId),
    { message: "Seleccioná producto O categoría, no ambos", path: ["categoryId"] }
  )
  .refine(
    (data) => data.type !== "percentage" || data.value <= 100,
    { message: "El porcentaje no puede exceder 100%", path: ["value"] }
  );

export const couponSchema = z
  .object({
    code: z.string().min(1, "El codigo es requerido").max(20),
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum(["percentage", "fixed", "free_shipping"]),
    value: z.number().min(0, "El valor debe ser positivo"),
    minPurchase: z.number().optional(),
    maxUses: z.number().optional(),
    maxUsesPerUser: z.number().min(1).default(1).optional(),
    startsAt: z.date().optional(),
    endsAt: z.date().optional(),
    active: z.boolean().default(true),
  })
  .refine(
    (data) => data.type !== "percentage" || data.value <= 100,
    { message: "El porcentaje no puede exceder 100%", path: ["value"] }
  );

export const subscriptionPlanSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug invalido"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser positivo"),
  interval: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  features: z.array(z.string()).optional(),
  active: z.boolean().default(true),
});

export type DiscountInput = z.infer<typeof discountSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type SubscriptionPlanInput = z.infer<typeof subscriptionPlanSchema>;
