// ─── Status Transition Rules ──────────────────────────────

export const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled", "paid"], // return
  delivered: ["cancelled"],
  cancelled: [], // terminal
};

export const DESTRUCTIVE_TRANSITIONS = new Set(["cancelled", "delivered"]);

export function isValidTransition(from: string, to: string): boolean {
  if (from === to) return true; // same-status = notes-only update
  return VALID_ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}
