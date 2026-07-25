import { describe, it, expect } from "vitest";
import {
  productSchema,
  categorySchema,
  variantSchema,
  couponSchema,
  discountSchema,
  subscriptionPlanSchema,
  orderStatusSchema,
  orderTransitionSchema,
  shipmentMethodSchema,
} from "./schemas";

// ─── productSchema ──────────────────────────────────────

describe("productSchema", () => {
  const validProduct = {
    name: "Test Product",
    slug: "test-product",
    description: "A test product",
    basePrice: 1500,
    categoryId: "cat-1",
    status: "active" as const,
    featured: false,
    images: ["/test.jpg"],
  };

  it("accepts valid product", () => {
    expect(productSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = productSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects bad slug format", () => {
    const result = productSchema.safeParse({ ...validProduct, slug: "Bad Slug" });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = productSchema.safeParse({ ...validProduct, basePrice: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects missing categoryId", () => {
    const result = productSchema.safeParse({ ...validProduct, categoryId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = productSchema.safeParse({ ...validProduct, status: "unknown" });
    expect(result.success).toBe(false);
  });

  it("rejects empty images", () => {
    const result = productSchema.safeParse({ ...validProduct, images: [] });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["active", "inactive", "draft"]) {
      const result = productSchema.safeParse({ ...validProduct, status });
      expect(result.success).toBe(true);
    }
  });
});

// ─── categorySchema ─────────────────────────────────────

describe("categorySchema", () => {
  const validCategory = {
    name: "Test Category",
    slug: "test-category",
  };

  it("accepts valid category", () => {
    expect(categorySchema.safeParse(validCategory).success).toBe(true);
  });

  it("rejects bad slug format", () => {
    const result = categorySchema.safeParse({ ...validCategory, slug: "Bad Slug" });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = categorySchema.safeParse({ ...validCategory, name: "" });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = categorySchema.safeParse({
      ...validCategory,
      description: "A description",
      image: "/img.jpg",
      active: true,
      sortOrder: 1,
    });
    expect(result.success).toBe(true);
  });
});

// ─── variantSchema ──────────────────────────────────────

describe("variantSchema", () => {
  const validVariant = {
    name: "Black / L",
    sku: "SKU-001",
    price: 1500,
    stock: 10,
  };

  it("accepts valid variant", () => {
    expect(variantSchema.safeParse(validVariant).success).toBe(true);
  });

  it("rejects missing SKU", () => {
    const result = variantSchema.safeParse({ ...validVariant, sku: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative stock", () => {
    const result = variantSchema.safeParse({ ...validVariant, stock: -5 });
    expect(result.success).toBe(false);
  });

  it("accepts zero stock", () => {
    const result = variantSchema.safeParse({ ...validVariant, stock: 0 });
    expect(result.success).toBe(true);
  });

  it("accepts optional options", () => {
    const result = variantSchema.safeParse({
      ...validVariant,
      options: { color: "Black", size: "L" },
    });
    expect(result.success).toBe(true);
  });
});

// ─── couponSchema ───────────────────────────────────────

describe("couponSchema", () => {
  const validCoupon = {
    code: "TEST10",
    name: "Test Coupon",
    type: "percentage" as const,
    value: 10,
  };

  it("accepts valid coupon", () => {
    expect(couponSchema.safeParse(validCoupon).success).toBe(true);
  });

  it("rejects code too long", () => {
    const result = couponSchema.safeParse({ ...validCoupon, code: "A".repeat(21) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = couponSchema.safeParse({ ...validCoupon, type: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid types", () => {
    for (const type of ["percentage", "fixed", "free_shipping"]) {
      const result = couponSchema.safeParse({ ...validCoupon, type });
      expect(result.success).toBe(true);
    }
  });
});

// ─── discountSchema ─────────────────────────────────────

describe("discountSchema", () => {
  const validDiscount = {
    name: "Summer Sale",
    type: "percentage" as const,
    value: 20,
  };

  it("accepts valid discount", () => {
    expect(discountSchema.safeParse(validDiscount).success).toBe(true);
  });

  it("rejects negative value", () => {
    const result = discountSchema.safeParse({ ...validDiscount, value: -10 });
    expect(result.success).toBe(false);
  });

  it("accepts zero value", () => {
    const result = discountSchema.safeParse({ ...validDiscount, value: 0 });
    expect(result.success).toBe(true);
  });
});

// ─── subscriptionPlanSchema ─────────────────────────────

describe("subscriptionPlanSchema", () => {
  const validPlan = {
    name: "Premium Plan",
    slug: "premium-plan",
    price: 5000,
  };

  it("accepts valid plan", () => {
    expect(subscriptionPlanSchema.safeParse(validPlan).success).toBe(true);
  });

  it("rejects invalid slug", () => {
    const result = subscriptionPlanSchema.safeParse({ ...validPlan, slug: "Invalid Slug" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid interval", () => {
    const result = subscriptionPlanSchema.safeParse({ ...validPlan, interval: "weekly" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid intervals", () => {
    for (const interval of ["monthly", "quarterly", "yearly"]) {
      const result = subscriptionPlanSchema.safeParse({ ...validPlan, interval });
      expect(result.success).toBe(true);
    }
  });
});

// ─── orderStatusSchema ──────────────────────────────────

describe("orderStatusSchema", () => {
  it("accepts valid statuses", () => {
    for (const status of ["pending", "paid", "shipped", "delivered", "cancelled"]) {
      const result = orderStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    const result = orderStatusSchema.safeParse({ status: "unknown" });
    expect(result.success).toBe(false);
  });
});

// ─── orderTransitionSchema ──────────────────────────────

describe("orderTransitionSchema", () => {
  it("accepts valid transition pair", () => {
    const result = orderTransitionSchema.safeParse({ fromStatus: "pending", toStatus: "paid" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid fromStatus", () => {
    const result = orderTransitionSchema.safeParse({ fromStatus: "unknown", toStatus: "paid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid toStatus", () => {
    const result = orderTransitionSchema.safeParse({ fromStatus: "pending", toStatus: "unknown" });
    expect(result.success).toBe(false);
  });

  it("accepts same status (notes-only)", () => {
    const result = orderTransitionSchema.safeParse({ fromStatus: "pending", toStatus: "pending" });
    expect(result.success).toBe(true);
  });
});

// ─── shipmentMethodSchema ───────────────────────────────

describe("shipmentMethodSchema", () => {
  const validMethod = {
    name: "Standard Shipping",
    cost: 1500,
    estimatedDays: 3,
  };

  it("accepts valid method", () => {
    expect(shipmentMethodSchema.safeParse(validMethod).success).toBe(true);
  });

  it("rejects zero days", () => {
    const result = shipmentMethodSchema.safeParse({ ...validMethod, estimatedDays: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative cost", () => {
    const result = shipmentMethodSchema.safeParse({ ...validMethod, cost: -500 });
    expect(result.success).toBe(false);
  });
});
