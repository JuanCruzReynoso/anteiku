import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Disable prefetch — not supported for Supabase Transaction pool mode
// max: 3 — fits serverless concurrency without exhausting Supabase pool
const client = postgres(env.DATABASE_URL, {
  prepare: false,
  max: 3,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
