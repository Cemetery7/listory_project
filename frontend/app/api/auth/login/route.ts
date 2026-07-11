import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/auth/cookies";
import { createSessionToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { errorResponse } from "@/lib/auth/responses";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const payload = await readJsonBody<LoginPayload>(request);

  if (!payload) {
    return errorResponse("invalid_json", "Некорректный запрос.", 400);
  }

  const email = payload.email?.trim().toLowerCase();
  const password = payload.password ?? "";

  if (!email || !password) {
    return errorResponse("validation_error", "Email and password are required.", 422);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return errorResponse("invalid_credentials", "Invalid email or password.", 401);
    }

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });
    const response = NextResponse.json({ data: { user: { id: user.id, username: user.username, email: user.email } } });
    setAuthCookie(response, token);

    return response;
  } catch {
    return errorResponse("login_failed", "Не удалось войти. Попробуйте позже.", 500);
  }
}
