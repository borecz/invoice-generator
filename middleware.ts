import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Get the current user (more secure than getSession)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Middleware: Error getting user:", error.message);
    // Allow request to proceed if there's an error, or handle differently
    return res;
  }

  const authenticated = !!user;
  const { pathname } = req.nextUrl;

  // Define protected routes
  const protectedRoutes = [
    "/new",
    "/dashboard",
    "/invoices",
    "/customers",
    "/settings",
  ]; // Added /customers and /settings
  // Define auth routes (for logged-in users to be redirected away from)
  const authRoutes = ["/auth/login", "/auth/signup"];

  // If user is not authenticated and trying to access a protected route
  if (
    !authenticated &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    console.log(
      `Middleware: Unauthenticated access to ${pathname}. Redirecting to /auth/login.`
    );
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // If user is authenticated and trying to access an auth route
  if (authenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    console.log(
      `Middleware: Authenticated access to ${pathname}. Redirecting to /dashboard.`
    );
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

// Configure the matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (public landing page, if you want it to be always accessible) - adjust as needed
     * - /auth/callback (Supabase auth callback)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback).*)",
    // Explicitly include routes that need checking, if the above is too broad or misses some.
    // '/new/:path*', // if /new has sub-paths
    // '/dashboard/:path*', // if /dashboard has sub-paths
    // '/auth/login',
    // '/auth/signup',
  ],
};
