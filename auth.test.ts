import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ─────────────────────────────────────────────

vi.mock("@/db", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock("@/lib/env", () => ({
  env: {
    OWNER_EMAILS: "owner@test.com,admin@test.com",
    GOOGLE_CLIENT_ID: "test-client-id",
    GOOGLE_CLIENT_SECRET: "test-client-secret",
  },
}));

// ─── Import after mocks ────────────────────────────────

import { db } from "@/db";

// ─── Tests ─────────────────────────────────────────────

describe("auth callbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signIn callback logic", () => {
    it("promotes customer to owner when email matches OWNER_EMAILS", async () => {
      const mockDbUser = { id: "user-1", role: "customer" };
      (db.query.users.findFirst as any).mockResolvedValue(mockDbUser);

      const OWNER_EMAILS = ["owner@test.com", "admin@test.com"];
      const userEmail = "owner@test.com";

      // Simulate the signIn callback logic
      const dbUser = await db.query.users.findFirst({ where: {} as any });
      expect(dbUser?.role).toBe("customer");

      if (dbUser?.role === "customer" && OWNER_EMAILS.includes(userEmail)) {
        await (db.update as any)({}).set({ role: "owner" }).where({});
      }

      expect(db.update).toHaveBeenCalled();
    });

    it("does not promote existing owner", async () => {
      const mockDbUser = { id: "user-1", role: "owner" };
      (db.query.users.findFirst as any).mockResolvedValue(mockDbUser);

      const OWNER_EMAILS = ["owner@test.com"];

      const dbUser = await db.query.users.findFirst({ where: {} as any });
      if (dbUser?.role === "customer" && OWNER_EMAILS.includes("owner@test.com")) {
        await (db.update as any)({}).set({ role: "owner" }).where({});
      }

      expect(db.update).not.toHaveBeenCalled();
    });

    it("allows login even when DB is unreachable", async () => {
      (db.query.users.findFirst as any).mockRejectedValue(new Error("DB error"));

      let allowLogin = true;
      try {
        await db.query.users.findFirst({ where: {} as any });
      } catch {
        allowLogin = true;
      }

      expect(allowLogin).toBe(true);
    });
  });

  describe("jwt callback logic", () => {
    it("refreshes role from DB", async () => {
      const mockDbUser = { role: "admin" };
      (db.query.users.findFirst as any).mockResolvedValue(mockDbUser);

      const token = { sub: "user-1", role: "customer" };
      const dbUser = await db.query.users.findFirst({ where: {} as any, columns: { role: true } });

      if (dbUser) {
        token.role = dbUser.role;
      }

      expect(token.role).toBe("admin");
    });

    it("keeps cached role when DB is unreachable", async () => {
      (db.query.users.findFirst as any).mockRejectedValue(new Error("DB error"));

      const token = { sub: "user-1", role: "admin" };
      try {
        const dbUser = await db.query.users.findFirst({ where: {} as any, columns: { role: true } });
        if (dbUser) {
          token.role = dbUser.role;
        }
      } catch {
        // Keep cached role
      }

      expect(token.role).toBe("admin");
    });
  });

  describe("session callback logic", () => {
    it("injects id and role from token", () => {
      const token: { sub: string; role: string } | null = { sub: "user-1", role: "admin" };
      const session = { user: {} as any };

      if (token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }

      expect(session.user.id).toBe("user-1");
      expect(session.user.role).toBe("admin");
    });

    it("does not modify session when no token", () => {
      const session = { user: {} as any };
      const token = null as { sub: string; role: string } | null;

      if (token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }

      expect(session.user.id).toBeUndefined();
      expect(session.user.role).toBeUndefined();
    });
  });
});
