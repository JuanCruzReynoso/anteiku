import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSession } from "@/tests/factories";

// ─── Mocks ─────────────────────────────────────────────

const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (...args: any[]) => mockRedirect(...args),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// ─── Import after mocks ────────────────────────────────

import { requireAdmin, getAdminUser } from "./actions";
import { auth } from "@/auth";

// ─── Tests ─────────────────────────────────────────────

describe("admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // redirect throws in Vitest by default, mock it to not throw
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  describe("requireAdmin", () => {
    it("returns session for owner", async () => {
      const session = createMockSession({ role: "owner" });
      (auth as any).mockResolvedValue(session);

      const result = await requireAdmin();
      expect(result).toEqual(session);
    });

    it("returns session for admin", async () => {
      const session = createMockSession({ role: "admin" });
      (auth as any).mockResolvedValue(session);

      const result = await requireAdmin();
      expect(result).toEqual(session);
    });

    it("redirects to / for customer", async () => {
      const session = createMockSession({ role: "customer" });
      (auth as any).mockResolvedValue(session);

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    it("redirects to /login when no session", async () => {
      (auth as any).mockResolvedValue(null);

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/login?redirectedFrom=/admin");
    });

    it("redirects to /login when auth throws", async () => {
      (auth as any).mockRejectedValue(new Error("Auth error"));

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/login?redirectedFrom=/admin");
    });
  });

  describe("getAdminUser", () => {
    it("returns user from session", async () => {
      const session = createMockSession({ role: "admin" });
      (auth as any).mockResolvedValue(session);

      const result = await getAdminUser();
      expect(result).toEqual(session.user);
    });
  });
});
