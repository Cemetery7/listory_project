import { clearAuthCookie } from "./cookies";
import { errorResponse } from "./responses";
import { getCurrentUser } from "./session";

export async function authorizeActiveUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: errorResponse("unauthorized", "Требуется авторизация.", 401)
    } as const;
  }

  if (user.status === "BLOCKED") {
    const response = errorResponse("account_blocked", "Аккаунт заблокирован.", 403);
    clearAuthCookie(response);

    return { response } as const;
  }

  return { user } as const;
}

export async function authorizeAdmin() {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization;
  }

  if (authorization.user.role !== "ADMIN") {
    return {
      response: errorResponse("forbidden", "Недостаточно прав.", 403)
    } as const;
  }

  return authorization;
}
