import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ──────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    transaction: vi.fn(),
  },
}));

vi.mock("@/lib/email", () => ({
  sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocks are set up
import { createOrder } from "./actions";
import { auth } from "@/auth";
import { db } from "@/db";
import { sendOrderConfirmation } from "@/lib/email";

// ─── Helpers ────────────────────────────────────────────

const VALID_INPUT = {
  items: [{ variantId: "550e8400-e29b-41d4-a716-446655440001", quantity: 2 }],
  shippingAddress: {
    email: "test@example.com",
    name: "Juan Pérez",
    line1: "Av. Corrientes 1234",
    city: "Buenos Aires",
    state: "CABA",
    postalCode: "1043",
    country: "AR",
    phone: "+5491123456789",
  },
  email: "test@example.com",
};

function mockAuth(user: { id: string } | null) {
  vi.mocked(auth).mockResolvedValue(user ? { user } as any : null);
}

function mockDbTransactionSuccess(orderId = "order-123") {
  const lockedResult = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      stock: 10,
      price: 1500,
      product_name: "Test Product",
    },
  ];

  const mockTx = {
    execute: vi.fn().mockResolvedValue(lockedResult),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: orderId }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  };

  vi.mocked(db.transaction).mockImplementation(async (cb: any) => {
    return cb(mockTx);
  });

  return { mockTx, lockedResult };
}

function mockDbTransactionInsufficientStock() {
  const lockedResult = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      stock: 2, // insufficient for qty 5
      price: 1500,
      product_name: "Test Product",
    },
  ];

  vi.mocked(db.transaction).mockImplementation(async (cb: any) => {
    const mockTx = {
      execute: vi.fn().mockResolvedValue(lockedResult),
    };
    return cb(mockTx);
  });
}

// ─── Tests ──────────────────────────────────────────────

describe("createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an order successfully", async () => {
    mockAuth({ id: "user-1" });
    mockDbTransactionSuccess("order-42");

    const result = await createOrder(VALID_INPUT);

    expect(result).toEqual({ orderId: "order-42" });
    expect(auth).toHaveBeenCalledOnce();
    expect(db.transaction).toHaveBeenCalledOnce();
    expect(sendOrderConfirmation).toHaveBeenCalledOnce();
    expect(sendOrderConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-42",
        email: "test@example.com",
      })
    );
  });

  it("returns error when user is not authenticated", async () => {
    mockAuth(null);

    const result = await createOrder(VALID_INPUT);

    expect(result).toEqual({
      error: "Tenés que estar logueado para hacer un pedido.",
    });
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("returns error when cart is empty", async () => {
    mockAuth({ id: "user-1" });

    const result = await createOrder({
      ...VALID_INPUT,
      items: [],
    });

    expect(result.error).toBeDefined();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("returns error on insufficient stock", async () => {
    mockAuth({ id: "user-1" });
    mockDbTransactionInsufficientStock();

    const input = {
      ...VALID_INPUT,
      items: [{ variantId: "550e8400-e29b-41d4-a716-446655440001", quantity: 5 }],
    };

    const result = await createOrder(input);

    expect(result.error).toContain("Stock insuficiente");
    expect(sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it("returns Zod error for invalid input", async () => {
    mockAuth({ id: "user-1" });

    const invalidInput = {
      items: [], // fails min(1)
      shippingAddress: VALID_INPUT.shippingAddress,
      email: "not-an-email",
    };

    const result = await createOrder(invalidInput as any);

    expect(result.error).toBeDefined();
    expect(result.error).not.toContain("Tenés que estar logueado");
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("returns error when variant is not found", async () => {
    mockAuth({ id: "user-1" });

    const lockedResult: any[] = []; // no variants returned
    vi.mocked(db.transaction).mockImplementation(async (cb: any) => {
      const mockTx = { execute: vi.fn().mockResolvedValue(lockedResult) };
      return cb(mockTx);
    });

    const result = await createOrder(VALID_INPUT);

    expect(result.error).toContain("no encontrada");
  });

  it("does not send email when transaction fails", async () => {
    mockAuth({ id: "user-1" });
    vi.mocked(db.transaction).mockRejectedValue(new Error("DB connection lost"));

    const result = await createOrder(VALID_INPUT);

    expect(result.error).toBe("DB connection lost");
    expect(sendOrderConfirmation).not.toHaveBeenCalled();
  });
});
