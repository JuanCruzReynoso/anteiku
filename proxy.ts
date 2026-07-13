import { auth } from "@/auth";
import { updateSession } from "@/lib/supabase/middleware";

export const proxy = auth(async (req) => {
  // 1. Refresh Supabase session (keeps tokens alive)
  const supabaseResponse = await updateSession(req as any);

  // 2. Auth.js route protection
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");
  const isProtectedRoute = pathname.startsWith("/checkout");
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
