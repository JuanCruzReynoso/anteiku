import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ──────────────────────────────────────────────

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number; // cents
  quantity: number;
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

        let next: CartItem[];
        if (existing) {
          next = items.map((i) =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          next = [...items, { ...item, quantity }];
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
      // Rehydrate totals on load
      onRehydrateStorage: () => (state) => {
        if (state) {
          const totals = computeTotals(state.items);
          state.itemCount = totals.itemCount;
          state.total = totals.total;
        }
      },
    }
  )
);
