import { NextRequest, NextResponse } from "next/server";
import { authCookieName } from "./lib/auth/cookies";
import { verifySessionToken } from "./lib/auth/jwt";

function isProtectedEditRoute(pathname: string) {
  return pathname.startsWith("/edit") || (pathname.startsWith("/works/") && pathname.includes("/edit"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!shouldProtectPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(authCookieName)?.value;

  if (token) {
    const session = await verifySessionToken(token).catch(() => null);

    if (session) {
      return NextResponse.next();
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/create/:path*", "/profile/:path*", "/library/:path*", "/history/:path*", "/my-works/:path*", "/settings/:path*", "/admin/:path*", "/edit/:path*", "/works/:path*"]
};

export function shouldProtectPath(pathname: string) {
  return (
    pathname.startsWith("/create") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/my-works") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin") ||
    isProtectedEditRoute(pathname)
  );
}
