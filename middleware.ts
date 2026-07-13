import { auth } from "@/auth";
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export default auth(async (req) => {
  // 1. Refresh Supabase session (keeps tokens alive)
  const supabaseResponse = await updateSession(req);

  // 2. Auth.js route protection
  const isLoggedIn = !!req.auth;
  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/forgot-password");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/checkout");

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(
      new URL(
        `/login?redirectedFrom=${req.nextUrl.pathname}`,
        req.url,
      ),
    );
  }

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
