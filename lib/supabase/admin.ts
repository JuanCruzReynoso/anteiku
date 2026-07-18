import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Admin client with service role — bypasses RLS
// ONLY use in server-side admin operations
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
