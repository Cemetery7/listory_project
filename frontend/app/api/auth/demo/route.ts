import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAuthConfigured, AuthConfigurationError, createSessionToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { setAuthCookie } from "@/lib/auth/cookies";
import { errorResponse } from "@/lib/auth/responses";

export async function POST() {
  try {
    assertAuthConfigured();
    const passwordHash = await hashPassword("demo");
    const user = await prisma.user.upsert({
      where: { email: "demo@listoria.local" },
      update: { username: "Demo" },
      create: {
        username: "Demo",
        email: "demo@listoria.local",
        passwordHash
      }
    });

    if (user.status === "BLOCKED") {
      return errorResponse("account_blocked", "Demo-аккаунт заблокирован.", 403);
    }

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });
    const response = NextResponse.json({ data: { user: { id: user.id, username: user.username, email: user.email } } });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Demo login failed", error);

    if (error instanceof AuthConfigurationError) {
      return errorResponse("auth_unavailable", "Авторизация временно недоступна. Обратитесь к администратору.", 503);
    }

    return errorResponse("demo_login_failed", "Demo login failed.", 500);
  }
}
