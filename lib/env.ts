/**
 * Centralized environment variable validation.
 * Fails fast at startup with a clear message instead of cryptic runtime errors.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${name}\n` +
        `Add it to your .env file or environment configuration.`
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  AUTH_SECRET: required("AUTH_SECRET"),
  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
  NEXT_PUBLIC_SUPABASE_URL: required("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  OWNER_EMAILS: optional("OWNER_EMAILS"),
} as const;
