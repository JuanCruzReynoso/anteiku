import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createMockCoupon } from "@/tests/factories";

// ─── Mocks ─────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      coupons: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("./actions", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }),
}));

// ─── Import after mocks ────────────────────────────────

import { validateCoupon, createCoupon } from "./coupon-actions";
import { db } from "@/db";

// ─── Tests ─────────────────────────────────────────────

describe("coupon-actions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("validateCoupon", () => {
    it("rejects inactive coupon", async () => {
      const coupon = createMockCoupon({ active: false });
      (db.query.coupons.findFirst as any).mockResolvedValue(coupon);

      const result = await validateCoupon("TEST10", 5000);
      expect(result).toEqual({ valid: false, error: "Cupon no valido" });
    });

    it("rejects coupon not yet active", async () => {
      const coupon = createMockCoupon({
        startsAt: new Date("2026-08-01"),
      });
      (db.query.coupons.findFirst as any).mockResolvedValue(coupon);

      const result = await validateCoupon("TEST10", 5000);
      expect(result).toEqual({ valid: false, error: "El cupon aun no esta activo" });
    });

    it("rejects expired coupon", async () => {
      const coupon = createMockCoupon({
        endsAt: new Date("2026-06-01"),
      });
      (db.query.coupons.findFirst as any).mockResolvedValue(coupon);

      const result = await validateCoupon("TEST10", 5000);
      expect(result).toEqual({ valid: false, error: "El cupon expiro" });
    });

    it("rejects coupon with max uses reached", async () => {
      const coupon = createMockCoupon({
        maxUses: 10,
        usedCount: 10,
      });
      (db.query.coupons.findFirst as any).mockResolvedValue(coupon);

      const result = await validateCoupon("TEST10", 5000);
      expect(result).toEqual({ valid: false, error: "El cupon alcanzo el maximo de usos" });
    });

    it("rejects coupon when min purchase not met", async () => {
      const coupon = createMockCoupon({
        minPurchase: 5000,
      });
      (db.query.coupons.findFirst as any).mockResolvedValue(coupon);

      const result = await validateCoupon("TEST10", 3000);
      expect(result).toEqual({ valid: false, error: "Compra minima: $5000" });
    });

    it("accepts valid coupon", async () => {
      const coupon = createMockCoupon();
      (db.query.coupons.findFirst as any).mockResolvedValue(coupon);

      const result = await validateCoupon("TEST10", 5000);
      expect(result).toEqual({ valid: true, coupon });
    });

    it("rejects non-existent coupon", async () => {
      (db.query.coupons.findFirst as any).mockResolvedValue(null);

      const result = await validateCoupon("INVALID", 5000);
      expect(result).toEqual({ valid: false, error: "Cupon no valido" });
    });
  });

  describe("createCoupon", () => {
    it("creates coupon with valid data", async () => {
      const mockCoupon = createMockCoupon();
      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCoupon]),
        }),
      };
      (db.insert as any).mockReturnValue(insertChain);

      const result = await createCoupon({
        code: "TEST10",
        name: "Test Coupon",
        type: "percentage",
        value: 10,
      });

      expect(result).toEqual(mockCoupon);
    });

    it("returns error for invalid data", async () => {
      const result = await createCoupon({
        code: "",
        name: "",
        type: "invalid",
        value: -10,
      });

      expect(result).toHaveProperty("error");
    });

    it("converts code to uppercase", async () => {
      const mockCoupon = createMockCoupon({ code: "TEST10" });
      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCoupon]),
        }),
      };
      (db.insert as any).mockReturnValue(insertChain);

      await createCoupon({
        code: "test10",
        name: "Test",
        type: "percentage",
        value: 10,
      });

      expect(insertChain.values).toHaveBeenCalledWith(
        expect.objectContaining({ code: "TEST10" })
      );
    });
  });
});
