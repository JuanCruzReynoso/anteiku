import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage before importing the store
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Must import AFTER the mock is in place
const { useCartStore } = await import("./cart-store");

// ─── Helpers ────────────────────────────────────────────

function baseItem(overrides: Partial<Parameters<typeof useCartStore.getState>["0"]> = {}) {
  return {
    variantId: "v-001",
    productId: "p-001",
    name: "Test Product",
    variantName: "Default",
    price: 1000,
    stock: 10,
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────

describe("Cart Store", () => {
  beforeEach(() => {
    // Reset store to empty state
    useCartStore.setState({ items: [], itemCount: 0, total: 0 });
    localStorageMock.clear();
  });

  describe("addItem — stock cap", () => {
    it("caps quantity at available stock when adding a new item", () => {
      const item = baseItem({ stock: 5 });
      useCartStore.getState().addItem(item, 10);

      const { items, itemCount, total } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5);
      expect(itemCount).toBe(5);
      expect(total).toBe(5000); // 5 * 1000
    });

    it("caps total quantity at stock when adding existing item", () => {
      const item = baseItem({ stock: 5 });
      const { addItem } = useCartStore.getState();

      // First add: qty 3
      addItem(item, 3);
      // Second add: qty 5 → total 8, but stock is 5
      addItem(item, 5);

      const { items, itemCount } = useCartStore.getState();
      expect(items[0].quantity).toBe(5);
      expect(itemCount).toBe(5);
    });

    it("respects requested quantity when under stock", () => {
      const item = baseItem({ stock: 10 });
      useCartStore.getState().addItem(item, 3);

      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(3);
    });

    it("adds 0 quantity when stock is 0", () => {
      const item = baseItem({ stock: 0 });
      useCartStore.getState().addItem(item, 5);

      const { items, itemCount } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(0);
      expect(itemCount).toBe(0);
    });

    it("defaults to quantity 1 when no quantity argument", () => {
      const item = baseItem({ stock: 10 });
      useCartStore.getState().addItem(item);

      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(1);
    });

    it("caps default quantity 1 at stock when stock is 1", () => {
      const item = baseItem({ stock: 1 });
      useCartStore.getState().addItem(item);

      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(1);
    });
  });

  describe("computeTotals", () => {
    it("calculates itemCount and total correctly", () => {
      const { addItem } = useCartStore.getState();
      addItem(baseItem({ variantId: "v-001", price: 1000, stock: 10 }), 2);
      addItem(baseItem({ variantId: "v-002", price: 2500, stock: 10 }), 1);

      const { itemCount, total } = useCartStore.getState();
      expect(itemCount).toBe(3); // 2 + 1
      expect(total).toBe(4500); // (2*1000) + (1*2500)
    });

    it("returns 0 totals when cart is empty", () => {
      const { itemCount, total } = useCartStore.getState();
      expect(itemCount).toBe(0);
      expect(total).toBe(0);
    });
  });

  describe("removeItem", () => {
    it("removes the item and updates totals", () => {
      const { addItem, removeItem } = useCartStore.getState();
      addItem(baseItem({ variantId: "v-001", price: 1000, stock: 10 }), 2);
      addItem(baseItem({ variantId: "v-002", price: 2500, stock: 10 }), 1);

      removeItem("v-001");

      const { items, itemCount, total } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].variantId).toBe("v-002");
      expect(itemCount).toBe(1);
      expect(total).toBe(2500);
    });

    it("removing non-existent item is a no-op", () => {
      const { addItem, removeItem } = useCartStore.getState();
      addItem(baseItem({ variantId: "v-001", price: 1000, stock: 10 }), 1);

      removeItem("v-999");

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
    });
  });

  describe("clearCart", () => {
    it("empties the cart and resets totals", () => {
      const { addItem, clearCart } = useCartStore.getState();
      addItem(baseItem({ variantId: "v-001", price: 1000, stock: 10 }), 3);

      clearCart();

      const { items, itemCount, total } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(itemCount).toBe(0);
      expect(total).toBe(0);
    });
  });

  describe("updateQuantity", () => {
    it("updates quantity of an existing item", () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem(baseItem({ variantId: "v-001", price: 1000, stock: 10 }), 1);

      updateQuantity("v-001", 5);

      const { items, itemCount, total } = useCartStore.getState();
      expect(items[0].quantity).toBe(5);
      expect(itemCount).toBe(5);
      expect(total).toBe(5000);
    });

    it("removes item when quantity is set to 0", () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem(baseItem({ variantId: "v-001", price: 1000, stock: 10 }), 3);

      updateQuantity("v-001", 0);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });

    it("removes item when quantity is negative", () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem(baseItem({ variantId: "v-001", price: 1000, stock: 10 }), 3);

      updateQuantity("v-001", -1);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });
});
