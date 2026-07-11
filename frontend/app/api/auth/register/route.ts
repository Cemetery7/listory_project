import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/auth/cookies";
import { createSessionToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { errorResponse } from "@/lib/auth/responses";

type RegisterPayload = {
  username?: string;
  email?: string;
  password?: string;
  repeatPassword?: string;
};

export async function POST(request: Request) {
  const payload = await readJsonBody<RegisterPayload>(request);

  if (!payload) {
    return errorResponse("invalid_json", "Некорректный запрос.", 400);
  }

  const username = payload.username?.trim();
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password ?? "";
  const repeatPassword = payload.repeatPassword ?? "";

  if (!username || !email || !password || !repeatPassword) {
    return errorResponse("validation_error", "Fill all required fields.", 422);
  }

  if (password.length < 6) {
    return errorResponse("weak_password", "Password must contain at least 6 characters.", 422);
  }

  if (password !== repeatPassword) {
    return errorResponse("password_mismatch", "Passwords do not match.", 422);
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return errorResponse("user_exists", "User with this email or username already exists.", 409);
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: await hashPassword(password)
      }
    });
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });
    const response = NextResponse.json({ data: { user: { id: user.id, username: user.username, email: user.email } } }, { status: 201 });
    setAuthCookie(response, token);

    return response;
  } catch {
    return errorResponse("register_failed", "Не удалось создать аккаунт. Попробуйте позже.", 500);
  }
}
