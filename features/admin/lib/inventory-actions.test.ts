import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockVariant } from "@/tests/factories";

// ─── Mocks ─────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      inventoryMovements: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      variants: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
    insert: vi.fn(),
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

import { createInventoryMovement } from "./inventory-actions";
import { db } from "@/db";

// ─── Tests ─────────────────────────────────────────────

describe("inventory-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createInventoryMovement", () => {
    it("creates movement and updates stock", async () => {
      const mockMovement = { id: "mov-1", variantId: "var-1", change: -5, reason: "sale" };
      const mockVariant = createMockVariant({ stock: 10 });

      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockMovement]),
        }),
      };
      (db.insert as any).mockReturnValue(insertChain);
      (db.query.variants.findFirst as any).mockResolvedValue(mockVariant);
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await createInventoryMovement({
        variantId: "var-1",
        change: -5,
        reason: "sale",
      });

      expect(result).toEqual(mockMovement);
      expect(db.update).toHaveBeenCalled();
    });

    it("clamps stock to zero (no negative)", async () => {
      const mockVariant = createMockVariant({ stock: 3 });
      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "mov-1" }]),
        }),
      };
      (db.insert as any).mockReturnValue(insertChain);
      (db.query.variants.findFirst as any).mockResolvedValue(mockVariant);

      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };
      (db.update as any).mockReturnValue(updateChain);

      await createInventoryMovement({
        variantId: "var-1",
        change: -10,
        reason: "correction",
      });

      // Should set stock to max(0, 3 + (-10)) = 0
      expect(updateChain.set).toHaveBeenCalledWith({ stock: 0 });
    });

    it("handles positive stock change", async () => {
      const mockVariant = createMockVariant({ stock: 5 });
      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "mov-1" }]),
        }),
      };
      (db.insert as any).mockReturnValue(insertChain);
      (db.query.variants.findFirst as any).mockResolvedValue(mockVariant);

      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };
      (db.update as any).mockReturnValue(updateChain);

      await createInventoryMovement({
        variantId: "var-1",
        change: 10,
        reason: "restock",
      });

      // Should set stock to 5 + 10 = 15
      expect(updateChain.set).toHaveBeenCalledWith({ stock: 15 });
    });
  });
});
