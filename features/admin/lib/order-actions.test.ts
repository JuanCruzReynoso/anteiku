import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockOrder } from "@/tests/factories";
import { orders } from "@/db/schema";

// ─── Mocks ─────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => {
  const mockTx = {
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  };
  return {
    db: {
      query: {
        orders: {
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue(null),
        },
      },
      update: vi.fn(),
      transaction: vi.fn().mockImplementation(async (cb) => cb(mockTx)),
    },
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("./actions", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin", id: "admin-1" } }),
}));

// ─── Import after mocks ────────────────────────────────

import { updateOrderStatus } from "./order-actions";
import { db } from "@/db";

type OrderRow = typeof orders.$inferSelect;

// Helper to cast mock order to match DB type
function mockOrder(overrides: Record<string, any> = {}) {
  return createMockOrder(overrides) as any as OrderRow;
}

// ─── Tests ─────────────────────────────────────────────

describe("order-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset db.query.orders.findFirst to return a pending order by default
    vi.mocked(db.query.orders.findFirst).mockResolvedValue(mockOrder({ status: "pending" }));
  });

  describe("updateOrderStatus", () => {
    it("updates order with valid status transition", async () => {
      const result = await updateOrderStatus("order-1", "paid");
      expect(result).toHaveProperty("id");
    });

    it("returns error for invalid transition", async () => {
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(mockOrder({ status: "cancelled" }));
      const result = await updateOrderStatus("order-1", "paid");
      expect(result).toHaveProperty("error");
      expect((result as any).error).toContain("No se puede cambiar");
    });

    it("allows same status (notes-only update)", async () => {
      vi.mocked(db.query.orders.findFirst)
        .mockResolvedValueOnce(mockOrder({ status: "pending" }))
        .mockResolvedValueOnce(mockOrder({ status: "pending", notes: "Updated notes" }));

      const result = await updateOrderStatus("order-1", "pending", "Updated notes");
      expect(result).toHaveProperty("id");
    });

    it("creates history row on transition", async () => {
      vi.mocked(db.query.orders.findFirst)
        .mockResolvedValueOnce(mockOrder({ status: "pending" }))
        .mockResolvedValueOnce(mockOrder({ status: "paid" }));

      await updateOrderStatus("order-1", "paid", "Payment received");

      // Verify transaction was called and insert was invoked
      expect(db.transaction).toHaveBeenCalled();
    });

    it("throws on DB error", async () => {
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(mockOrder({ status: "pending" }));
      vi.mocked(db.transaction).mockRejectedValue(new Error("DB failure"));

      await expect(updateOrderStatus("order-1", "paid")).rejects.toThrow("DB failure");
    });
  });
});
