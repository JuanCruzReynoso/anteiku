import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockProduct } from "@/tests/factories";

// ─── Mocks ─────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      products: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
    select: vi.fn(),
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

import { toggleProductVisibility, createProduct, updateProduct } from "./product-actions";
import { db } from "@/db";
import { requireAdmin } from "./actions";

// ─── Tests ─────────────────────────────────────────────

describe("product-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toggleProductVisibility", () => {
    it("toggles active to inactive", async () => {
      const mockProduct = createMockProduct({ status: "active" });
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockProduct]),
          }),
        }),
      };
      (db.select as any).mockReturnValue(selectChain);
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await toggleProductVisibility("prod-1");
      expect(result).toEqual({ status: "inactive" });
    });

    it("toggles inactive to active", async () => {
      const mockProduct = createMockProduct({ status: "inactive" });
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockProduct]),
          }),
        }),
      };
      (db.select as any).mockReturnValue(selectChain);
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await toggleProductVisibility("prod-1");
      expect(result).toEqual({ status: "active" });
    });

    it("returns error for product not found", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      (db.select as any).mockReturnValue(selectChain);

      const result = await toggleProductVisibility("nonexistent");
      expect(result).toEqual({ error: "Producto no encontrado" });
    });
  });

  describe("createProduct", () => {
    it("creates product with valid data", async () => {
      const mockProduct = createMockProduct();
      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockProduct]),
        }),
      };
      (db.insert as any).mockReturnValue(insertChain);

      const result = await createProduct({
        name: "Test Product",
        slug: "test-product",
        description: "A test product",
        basePrice: 1500,
        categoryId: "cat-1",
        status: "active",
        featured: false,
        images: ["/test.jpg"],
      });

      expect(result).toEqual(mockProduct);
      expect(requireAdmin).toHaveBeenCalled();
    });

    it("returns error for invalid data", async () => {
      const result = await createProduct({
        name: "",
        slug: "test",
        description: "desc",
        basePrice: 1500,
        categoryId: "cat-1",
        status: "active",
        featured: false,
        images: [],
      });

      expect(result).toHaveProperty("error");
    });

    it("passes featured boolean directly to DB", async () => {
      const mockProduct = createMockProduct({ featured: true });
      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockProduct]),
        }),
      };
      (db.insert as any).mockReturnValue(insertChain);

      await createProduct({
        name: "Test",
        slug: "test",
        description: "desc",
        basePrice: 1000,
        categoryId: "cat-1",
        status: "active",
        featured: true,
        images: ["/img.jpg"],
      });

      expect(insertChain.values).toHaveBeenCalledWith(
        expect.objectContaining({ featured: true })
      );
    });
  });

  describe("updateProduct", () => {
    it("updates product with valid data", async () => {
      const mockProduct = createMockProduct({ name: "Updated" });
      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockProduct]),
          }),
        }),
      };
      (db.update as any).mockReturnValue(updateChain);

      const result = await updateProduct("prod-1", { name: "Updated" });
      expect(result).toEqual(mockProduct);
    });

    it("returns error for invalid data", async () => {
      const result = await updateProduct("prod-1", { basePrice: -100 });
      expect(result).toHaveProperty("error");
    });
  });
});
