import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Disable prefetch — not supported for Supabase Transaction pool mode
// max: 1 — conservative for build workers; Supabase free tier pool = 15
const client = postgres(env.DATABASE_URL, {
  prepare: false,
  max: 5,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
