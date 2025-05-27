import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

// Create the internationalization middleware with industry standard configuration
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Industry standard: always show locale in URL
  alternateLinks: true, // SEO: Generate hreflang tags
  localeDetection: true, // Smart detection for first-time visitors
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip i18n middleware for static files and API routes
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/auth/callback");

  if (isStaticFile) {
    return NextResponse.next();
  }

  // === LOCALE VALIDATION AND REDIRECTION LOGIC ===

  // Extract potential locale from pathname
  const segments = pathname.split("/").filter(Boolean);
  const potentialLocale = segments[0];

  // Check if the first segment is a valid locale
  const isValidLocale = locales.includes(potentialLocale as any);

  // Handle root path - redirect to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
  }

  // Handle invalid locale - redirect to default locale with same path
  if (potentialLocale && !isValidLocale && potentialLocale.length === 2) {
    // This looks like an invalid locale (2 characters), redirect to default locale
    const pathWithoutInvalidLocale = "/" + segments.slice(1).join("/");
    const redirectPath =
      pathWithoutInvalidLocale === "/"
        ? `/${defaultLocale}`
        : `/${defaultLocale}${pathWithoutInvalidLocale}`;
    console.log(
      `Middleware: Invalid locale "${potentialLocale}" detected. Redirecting to: ${redirectPath}`
    );
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // Handle malformed locale-like paths (3+ characters that might be typos)
  if (
    potentialLocale &&
    !isValidLocale &&
    potentialLocale.length >= 3 &&
    potentialLocale.length <= 5
  ) {
    // Check if it's similar to a valid locale (simple typo detection)
    const similarLocale = locales.find(
      (locale) =>
        locale
          .toLowerCase()
          .includes(potentialLocale.toLowerCase().substring(0, 2)) ||
        potentialLocale.toLowerCase().includes(locale.toLowerCase())
    );

    if (similarLocale) {
      const pathWithoutInvalidLocale = "/" + segments.slice(1).join("/");
      const redirectPath =
        pathWithoutInvalidLocale === "/"
          ? `/${similarLocale}`
          : `/${similarLocale}${pathWithoutInvalidLocale}`;
      console.log(
        `Middleware: Similar locale found for "${potentialLocale}". Redirecting to: ${redirectPath}`
      );
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  // Handle bare locale routes (e.g., /it, /cs, /ru) - these should show the landing page
  if (isValidLocale && segments.length === 1) {
    // Allow bare locale routes to proceed - they will show the landing page
    // No redirect needed, this is valid behavior
    console.log(
      `Middleware: Valid bare locale route "${potentialLocale}" - serving landing page`
    );
  }

  // Handle internationalization
  const intlResponse = intlMiddleware(req);

  // If intl middleware returns a redirect, return it
  if (intlResponse.status === 302 || intlResponse.status === 307) {
    return intlResponse;
  }

  // Create a new response based on the intl response
  const res = new NextResponse(intlResponse.body, {
    status: intlResponse.status,
    statusText: intlResponse.statusText,
    headers: intlResponse.headers,
  });

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

  // Handle auth session missing as normal state (user not logged in)
  if (error && error.message === "Auth session missing!") {
    // This is normal for unauthenticated users, continue without logging error
  } else if (error) {
    console.error("Middleware: Error getting user:", error.message);
    // Allow request to proceed if there's an error, or handle differently
    return res;
  }

  const authenticated = !!user;

  // Extract locale from pathname for route checking
  const pathnameWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  // Define protected routes
  const protectedRoutes = [
    "/new",
    "/dashboard",
    "/invoices",
    "/customers",
    "/settings",
  ];
  // Define auth routes (for logged-in users to be redirected away from)
  const authRoutes = ["/auth/login", "/auth/signup"];

  // If user is not authenticated and trying to access a protected route
  if (
    !authenticated &&
    protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))
  ) {
    console.log(
      `Middleware: Unauthenticated access to ${pathname}. Redirecting to /auth/login.`
    );
    // Preserve locale in redirect
    const locale = pathname.match(/^\/([a-z]{2})(?=\/|$)/)?.[1];
    const redirectPath = locale ? `/${locale}/auth/login` : "/auth/login";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // If user is authenticated and trying to access an auth route
  if (
    authenticated &&
    authRoutes.some((route) => pathnameWithoutLocale.startsWith(route))
  ) {
    console.log(
      `Middleware: Authenticated access to ${pathname}. Redirecting to /dashboard.`
    );
    // Preserve locale in redirect
    const locale = pathname.match(/^\/([a-z]{2})(?=\/|$)/)?.[1];
    const redirectPath = locale ? `/${locale}/dashboard` : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, req.url));
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
     * - auth/callback (Supabase auth callback)
     * - api routes
     * - static files
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|api|.*\\..*).*)",
  ],
};
