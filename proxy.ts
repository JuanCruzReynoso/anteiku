import { auth } from "@/auth";
import { updateSession } from "@/lib/supabase/middleware";
import { rateLimit } from "@/lib/rate-limit";

// ─── Rate limit config ──────────────────────────────────

const GENERAL_LIMIT = 100;
const SENSITIVE_LIMIT = 10;
const WINDOW_MS = 60_000; // 1 minute

const SENSITIVE_PATHS = ["/login", "/checkout"];

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// ─── Proxy ──────────────────────────────────────────────

export const proxy = auth(async (req) => {
  // 1. Refresh Supabase session (keeps tokens alive)
  const supabaseResponse = await updateSession(req as any);

  const pathname = req.nextUrl.pathname;

  // 2. Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const isSensitive = matchesAny(pathname, SENSITIVE_PATHS);
  const rateKey = isSensitive ? `sensitive:${ip}` : `general:${ip}`;
  const limit = isSensitive ? SENSITIVE_LIMIT : GENERAL_LIMIT;

  const { allowed } = await rateLimit(rateKey, limit, WINDOW_MS);
  if (!allowed) {
    return new Response("Too many requests", { status: 429 });
  }

  // 3. Auth.js route protection
  const isLoggedIn = !!req.auth;
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");
  const isProtectedRoute =
    pathname.startsWith("/checkout") || pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin");

  // Redirect unauthenticated users from protected routes
  if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
    return Response.redirect(
      new URL(
        `/login?redirectedFrom=${pathname}`,
        req.url,
      ),
    );
  }

  // Redirect non-admin users from admin routes
  if (isAdminRoute && isLoggedIn) {
    const role = (req.auth as any)?.user?.role;
    if (role !== "admin" && role !== "owner") {
      return Response.redirect(new URL("/", req.url));
    }
  }

  // Redirect logged-in users away from auth routes
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/shop", req.url));
  }

  return supabaseResponse;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
