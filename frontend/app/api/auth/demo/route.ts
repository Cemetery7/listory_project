import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { setAuthCookie } from "@/lib/auth/cookies";
import { errorResponse } from "@/lib/auth/responses";

export async function POST() {
  try {
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

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });
    const response = NextResponse.json({ data: { user: { id: user.id, username: user.username, email: user.email } } });
    setAuthCookie(response, token);

    return response;
  } catch {
    return errorResponse("demo_login_failed", "Demo login failed.", 500);
  }
}
