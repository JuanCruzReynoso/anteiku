import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  jsonb,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Auth.js Tables ──────────────────────────────────────

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: text("role").notNull().default("customer"), // "owner" | "admin" | "customer"
  phone: text("phone"),
  address: jsonb("address").$type<{
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>(),
});

export const accounts = pgTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ─── Enums ──────────────────────────────────────────────

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

// ─── Categories ─────────────────────────────────────────

export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Products ───────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  categoryId: text("category_id").references(() => categories.id),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  basePrice: integer("base_price").notNull(), // prices in ARS (integer)
  status: text("status").notNull().default("active"), // "active" | "inactive" | "draft"
  featured: text("featured").notNull().default("false"), // "true" | "false" stored as text for simplicity
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Variants ───────────────────────────────────────────

export const variants = pgTable("variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(), // e.g. "Black / L"
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  price: integer("price").notNull(), // override price in ARS (0 = use base)
  stock: integer("stock").default(0).notNull(),
  options: jsonb("options").$type<Record<string, string>>().default({}).notNull(), // e.g. { color: "Black", size: "L" }
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Orders ─────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  total: integer("total").notNull(), // prices in ARS (integer)
  notes: text("notes"),
  shipmentMethodId: text("shipment_method_id").references(() => shipmentMethods.id),
  shippingAddress: jsonb("shipping_address")
    .$type<{
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }>()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Order Items ────────────────────────────────────────

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => variants.id),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // price at time of purchase in ARS
});

// ─── Shipment Methods ────────────────────────────────────

export const shipmentMethods = pgTable("shipment_methods", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  cost: integer("cost").notNull(), // ARS integer
  estimatedDays: integer("estimated_days").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Payments ───────────────────────────────────────────

export const payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  method: text("method").notNull(), // "mercadopago", "cash", etc.
  transactionId: text("transaction_id"), // MercadoPago payment ID
  amount: integer("amount").notNull(), // ARS integer
  status: text("status").notNull().default("pending"), // "pending" | "completed" | "failed" | "refunded"
  metadata: jsonb("metadata"), // extra payment data from MercadoPago
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Addresses ──────────────────────────────────────────

export const addresses = pgTable("addresses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  name: text("name").notNull(), // "Casa", "Trabajo", etc.
  street: text("street").notNull(),
  streetNumber: text("street_number"),
  apartment: text("apartment"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("AR"),
  phone: text("phone"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Inventory Movements ────────────────────────────────

export const inventoryMovements = pgTable("inventory_movements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  variantId: uuid("variant_id").references(() => variants.id).notNull(),
  change: integer("change").notNull(), // positive = stock in, negative = stock out
  reason: text("reason").notNull(), // "purchase", "restock", "adjustment", "return"
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Discounts ─────────────────────────────────────────

export const discounts = pgTable("discounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: text("type").notNull(), // "percentage" | "fixed"
  value: integer("value").notNull(), // percentage (0-100) or fixed amount in ARS
  productId: uuid("product_id").references(() => products.id),
  categoryId: text("category_id").references(() => categories.id),
  minPurchase: integer("min_purchase"), // minimum purchase amount in ARS
  startsAt: timestamp("starts_at", { mode: "date" }),
  endsAt: timestamp("ends_at", { mode: "date" }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Coupons ───────────────────────────────────────────

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "percentage" | "fixed" | "free_shipping"
  value: integer("value").notNull(), // percentage (0-100) or fixed amount in ARS (0 for free_shipping)
  minPurchase: integer("min_purchase"), // minimum purchase amount in ARS
  maxUses: integer("max_uses"), // null = unlimited
  usedCount: integer("used_count").default(0).notNull(),
  maxUsesPerUser: integer("max_uses_per_user").default(1),
  startsAt: timestamp("starts_at", { mode: "date" }),
  endsAt: timestamp("ends_at", { mode: "date" }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Subscriptions ─────────────────────────────────────

export const subscriptionPlans = pgTable("subscription_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(), // monthly price in ARS
  interval: text("interval").notNull().default("monthly"), // "monthly" | "quarterly" | "yearly"
  features: jsonb("features").$type<string[]>().default([]).notNull(), // list of features
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  planId: text("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: text("status").notNull().default("active"), // "active" | "cancelled" | "past_due" | "paused"
  currentPeriodStart: timestamp("current_period_start", { mode: "date" }).notNull(),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }).notNull(),
  cancelAt: timestamp("cancel_at", { mode: "date" }),
  paymentMethodId: text("payment_method_id"), // MercadoPago subscription ID
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Relations ──────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  addresses: many(addresses),
  subscriptions: many(userSubscriptions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  discounts: many(discounts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(variants),
  discounts: many(discounts),
}));

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
  inventoryMovements: many(inventoryMovements),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  payments: many(payments),
  shipmentMethod: one(shipmentMethods, {
    fields: [orders.shipmentMethodId],
    references: [shipmentMethods.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(variants, {
    fields: [orderItems.variantId],
    references: [variants.id],
  }),
}));

export const shipmentMethodsRelations = relations(shipmentMethods, ({ many }) => ({
  orders: many(orders),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  variant: one(variants, {
    fields: [inventoryMovements.variantId],
    references: [variants.id],
  }),
}));

export const discountsRelations = relations(discounts, ({ one }) => ({
  product: one(products, {
    fields: [discounts.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [discounts.categoryId],
    references: [categories.id],
  }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));
