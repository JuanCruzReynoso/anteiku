import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCategory } from "@/tests/factories";

// ─── Mocks ─────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      categories: {
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

import { deleteCategory, createCategory, updateCategory } from "./category-actions";
import { db } from "@/db";

// ─── Tests ─────────────────────────────────────────────

describe("category-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deleteCategory", () => {
    it("deletes category without products", async () => {
      // Mock getCategoryById to return category with no products
      (db.query.categories.findFirst as any).mockResolvedValue({
        ...createMockCategory(),
        products: [],
      });
      (db.delete as any).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      await deleteCategory("cat-1");
      expect(db.delete).toHaveBeenCalled();
    });

    it("throws when category has products", async () => {
      // Mock getCategoryById to return category with products
      (db.query.categories.findFirst as any).mockResolvedValue({
        ...createMockCategory(),
        products: [{ id: "prod-1" }],
      });

      await expect(deleteCategory("cat-1")).rejects.toThrow(
        "No se puede eliminar una categoría con productos asociados"
      );
    });

    it("deletes category even when not found (no guard)", async () => {
      // Current behavior: deleteCategory doesn't check if category exists
      // It only checks if category has products
      (db.query.categories.findFirst as any).mockResolvedValue(null);
      (db.delete as any).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      // Current implementation doesn't throw for missing category
      await deleteCategory("nonexistent");
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("createCategory", () => {
    it("creates category with valid data", async () => {
      const mockCategory = createMockCategory();
      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCategory]),
        }),
      };
      (db.insert as any).mockReturnValue(insertChain);

      const result = await createCategory({
        name: "Test Category",
        slug: "test-category",
      });

      expect(result).toEqual(mockCategory);
    });

    it("returns error for invalid data", async () => {
      const result = await createCategory({
        name: "",
        slug: "Bad Slug",
      });

      expect(result).toHaveProperty("error");
    });
  });

  describe("updateCategory", () => {
    it("updates category with valid data", async () => {
      const mockCategory = createMockCategory({ name: "Updated" });
      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockCategory]),
          }),
        }),
      };
      (db.update as any).mockReturnValue(updateChain);

      const result = await updateCategory("cat-1", { name: "Updated" });
      expect(result).toEqual(mockCategory);
    });

    it("returns error for invalid data", async () => {
      const result = await updateCategory("cat-1", { slug: "Bad Slug" });
      expect(result).toHaveProperty("error");
    });
  });
});
