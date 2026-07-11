import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ──────────────────────────────────────────────

export const productCategoryEnum = pgEnum("product_category", [
  "coffee",
  "figures",
  "apparel",
  "stickers",
  "tamagotchis",
  "accessories",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

// ─── Products ───────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: productCategoryEnum("category").notNull(),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  basePrice: integer("base_price").notNull(), // stored in cents
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
  price: integer("price").notNull(), // override price in cents (0 = use base)
  stock: integer("stock").default(0).notNull(),
  options: jsonb("options").$type<Record<string, string>>().default({}).notNull(), // e.g. { color: "Black", size: "L" }
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Orders ─────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  total: integer("total").notNull(), // stored in cents
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
  unitPrice: integer("unit_price").notNull(), // price at time of purchase in cents
});

// ─── Relations ──────────────────────────────────────────

export const productsRelations = relations(products, ({ many }) => ({
  variantsList: many(variants),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
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
