import { NextRequest, NextResponse } from "next/server";

import { serverConfig } from "@/config/server";

const protectedRoutes = ["/dashboard", "/mfa"];

function startsWithRoute(
  pathname: string,
  routes: string[],
): boolean {
  return routes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );
}

export function proxy(
  request: NextRequest,
): NextResponse {
  const { pathname } = request.nextUrl;

  const hasAccessCookie = Boolean(
    request.cookies.get(
      serverConfig.accessCookieName,
    )?.value,
  );

  const hasRefreshCookie = Boolean(
    request.cookies.get(
      serverConfig.refreshCookieName,
    )?.value,
  );

  const hasSessionCookie =
    hasAccessCookie || hasRefreshCookie;

  if (
    startsWithRoute(pathname, protectedRoutes) &&
    !hasSessionCookie
  ) {
    const loginUrl = new URL(
      "/login",
      request.url,
    );

    loginUrl.searchParams.set(
      "returnTo",
      pathname,
    );

    return NextResponse.redirect(loginUrl);
  }

  /*
   * Do not redirect /login to /dashboard based only on the
   * presence of cookies. Cookies may be expired or invalid.
   * The backend is the source of truth for session validation.
   */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/mfa/:path*",
    "/login",
  ],
};