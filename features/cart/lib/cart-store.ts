import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logger } from "@/lib/logger";
import { CART_EXPIRATION_DAYS } from "@/lib/config";

const log = logger.create("cart");

// ─── Types ──────────────────────────────────────────────

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number; // ARS integer
  quantity: number;
  stock: number | null; // available stock at add time; null = unknown (legacy)
  addedAt?: number; // timestamp when item was added
  image?: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
}

interface CartActions {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

// ─── Helpers ────────────────────────────────────────────

function computeTotals(items: CartItem[]): Pick<CartState, "itemCount" | "total"> {
  return {
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}

// ─── Store ──────────────────────────────────────────────

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (item, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.variantId === item.variantId);

        // Use stock from item data if available, fallback to null (unknown) for legacy items
        const maxStock = item.stock ?? null;

        let next: CartItem[];
        if (existing) {
          const newQty = maxStock !== null ? Math.min(existing.quantity + quantity, maxStock) : existing.quantity + quantity;
          next = items.map((i) =>
            i.variantId === item.variantId
              ? { ...i, quantity: newQty }
              : i
          );
        } else {
          const cappedQty = maxStock !== null ? Math.min(quantity, maxStock) : quantity;
          next = [...items, { ...item, quantity: cappedQty, stock: maxStock, addedAt: Date.now() }];
        }

        set({ items: next, ...computeTotals(next) });
      },

      removeItem: (variantId) => {
        const next = get().items.filter((i) => i.variantId !== variantId);
        set({ items: next, ...computeTotals(next) });
      },

      updateQuantity: (variantId, quantity) => {
        const next =
          quantity <= 0
            ? get().items.filter((i) => i.variantId !== variantId)
            : get().items.map((i) =>
                i.variantId === variantId ? { ...i, quantity } : i
              );
        set({ items: next, ...computeTotals(next) });
      },

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
    }),
    {
      name: "anteiku-cart",
      // Only persist items — totals are derived
      partialize: (state) => ({ items: state.items }),
      // Rehydrate totals on load + validate stale items
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate each item has required fields — stale localStorage
          // may contain items referencing deleted products or old schema
          const before = state.items.length;
          state.items = state.items.filter(
            (item) =>
              item.variantId &&
              item.name &&
              typeof item.price === "number" &&
              item.price > 0 &&
              typeof item.quantity === "number" &&
              item.quantity > 0
          );

          // Migrate legacy items: unknown stock → null, add timestamp if missing
          state.items = state.items.map((item) => ({
            ...item,
            stock: typeof item.stock === "number" ? item.stock : null,
            addedAt: typeof item.addedAt === "number" ? item.addedAt : Date.now(),
          }));

          // Remove expired cart items
          const cutoff = Date.now() - CART_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
          const expiredCount = state.items.filter(
            (item) => typeof item.addedAt === "number" && item.addedAt < cutoff
          ).length;
          if (expiredCount > 0) {
            state.items = state.items.filter(
              (item) => typeof item.addedAt !== "number" || item.addedAt >= cutoff
            );
            log.warn(`Removed ${expiredCount} expired cart item(s) older than ${CART_EXPIRATION_DAYS} days`);
          }

          if (state.items.length < before) {
            log.warn(`Removed ${before - state.items.length} stale item(s) with missing data`);
          }

          const totals = computeTotals(state.items);
          state.itemCount = totals.itemCount;
          state.total = totals.total;
        }
      },
    }
  )
);
