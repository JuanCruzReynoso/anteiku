import type { Session } from "next-auth";

// ─── Mock Session Factory ──────────────────────────────

export function createMockSession(overrides: Partial<Session["user"]> = {}): Session {
  return {
    user: {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      image: null,
      role: "customer",
      ...overrides,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

// ─── Mock Product Factory ──────────────────────────────

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  status: "active" | "inactive" | "draft";
  featured: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function createMockProduct(overrides: Partial<MockProduct> = {}): MockProduct {
  return {
    id: "prod-1",
    name: "Test Product",
    slug: "test-product",
    description: "A test product",
    basePrice: 1500,
    categoryId: "cat-1",
    status: "active",
    featured: false,
    images: ["/test.jpg"],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Mock Category Factory ─────────────────────────────

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockCategory(overrides: Partial<MockCategory> = {}): MockCategory {
  return {
    id: "cat-1",
    name: "Test Category",
    slug: "test-category",
    description: "A test category",
    image: null,
    sortOrder: 0,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Mock Variant Factory ──────────────────────────────

export interface MockVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options: Record<string, string>;
  createdAt: Date;
}

export function createMockVariant(overrides: Partial<MockVariant> = {}): MockVariant {
  return {
    id: "var-1",
    productId: "prod-1",
    name: "Default",
    sku: "SKU-001",
    price: 0,
    stock: 10,
    options: {},
    createdAt: new Date(),
    ...overrides,
  };
}

// ─── Mock Coupon Factory ───────────────────────────────

export interface MockCoupon {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  usedCount: number;
  minPurchase: number | null;
  createdAt: Date;
}

export function createMockCoupon(overrides: Partial<MockCoupon> = {}): MockCoupon {
  return {
    id: "coupon-1",
    code: "TEST10",
    name: "Test Coupon",
    type: "percentage",
    value: 10,
    active: true,
    startsAt: new Date("2026-01-01"),
    endsAt: new Date("2026-12-31"),
    maxUses: 100,
    usedCount: 0,
    minPurchase: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

// ─── Mock Order Factory ────────────────────────────────

export interface MockOrder {
  id: string;
  userId: string | null;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockOrder(overrides: Partial<MockOrder> = {}): MockOrder {
  return {
    id: "order-1",
    userId: "user-1",
    status: "pending",
    total: 3000,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Mock User Factory ─────────────────────────────────

export interface MockUser {
  id: string;
  name: string | null;
  email: string;
  role: "owner" | "admin" | "customer";
  phone: string | null;
  createdAt: Date;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: "customer",
    phone: null,
    createdAt: new Date(),
    ...overrides,
  };
}
