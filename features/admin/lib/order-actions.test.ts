import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockOrder } from "@/tests/factories";

// ─── Mocks ─────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      orders: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
    update: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("./actions", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }),
}));

// ─── Import after mocks ────────────────────────────────

import { updateOrderStatus } from "./order-actions";
import { db } from "@/db";

// ─── Tests ─────────────────────────────────────────────

describe("order-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateOrderStatus", () => {
    it("updates order with valid status", async () => {
      const mockOrder = createMockOrder({ status: "paid" });
      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      };
      (db.update as any).mockReturnValue(updateChain);

      const result = await updateOrderStatus("order-1", "paid");
      expect(result).toEqual(mockOrder);
    });

    it("returns error for invalid status", async () => {
      const result = await updateOrderStatus("order-1", "unknown" as any);
      expect(result).toHaveProperty("error");
    });

    it("saves notes when provided", async () => {
      const mockOrder = createMockOrder({ status: "shipped", notes: "Test note" });
      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      };
      (db.update as any).mockReturnValue(updateChain);

      await updateOrderStatus("order-1", "shipped", "Test note");

      expect(updateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({ notes: "Test note" })
      );
    });

    it("does not include notes when not provided", async () => {
      const mockOrder = createMockOrder();
      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      };
      (db.update as any).mockReturnValue(updateChain);

      await updateOrderStatus("order-1", "pending");

      expect(updateChain.set).toHaveBeenCalledWith(
        expect.not.objectContaining({ notes: expect.anything() })
      );
    });
  });
});
