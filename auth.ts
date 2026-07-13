import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { env } from "@/lib/env";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

// Emails with owner access — configurable via env var (comma-separated)
const OWNER_EMAILS = env.OWNER_EMAILS?.split(",").map(e => e.trim()) ?? [];

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    role?: string;
  }
}

// Auth.js adapter-compatible tables (snake_case JS properties, same DB column names)
const adapterUsers = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

const adapterAccounts = pgTable(
  "accounts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => adapterUsers.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

const adapterSessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => adapterUsers.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

const adapterVerificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: adapterUsers,
    accountsTable: adapterAccounts,
    sessionsTable: adapterSessions,
    verificationTokensTable: adapterVerificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // On first login, assign owner role if email matches
      if (account?.provider === "google" && user.email) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });
          
          if (dbUser) {
            if (dbUser.role === "customer" && OWNER_EMAILS.includes(user.email)) {
              await db.update(users).set({ role: "owner" }).where(eq(users.id, dbUser.id));
              (user as any).role = "owner";
            } else {
              (user as any).role = dbUser.role;
            }
          }
        } catch {
          // DB unreachable during sign-in — allow login but without role assignment
          // User will get "customer" role (default) and can retry admin access later
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // On initial sign-in, set user data from OAuth
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role;
      }

      // Always refresh role from DB to catch admin changes without re-login
      if (token.sub) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, token.sub),
            columns: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch {
          // DB unreachable — keep cached role from token
        }
      }

      return token;
    },
  },
});
