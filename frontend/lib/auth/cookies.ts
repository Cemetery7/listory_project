import type { NextResponse } from "next/server";

export const authCookieName = "listoria_session";

const shouldUseSecureCookie = process.env.AUTH_COOKIE_SECURE === "true";

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: shouldUseSecureCookie,
  path: "/",
  maxAge: 60 * 60 * 24 * 7
};

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(authCookieName, token, authCookieOptions);
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(authCookieName, "", {
    ...authCookieOptions,
    maxAge: 0
  });
}
