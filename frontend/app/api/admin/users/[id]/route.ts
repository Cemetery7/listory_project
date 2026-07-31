import { readJsonBody } from "@/lib/api/request";
import { authorizeAdmin } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

type UserActionPayload = {
  action?: "block" | "unblock";
  reason?: string;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdmin();

  if ("response" in authorization) {
    return authorization.response;
  }

  const payload = await readJsonBody<UserActionPayload>(request);
  const { id } = await params;

  if (!payload || (payload.action !== "block" && payload.action !== "unblock")) {
    return errorResponse("validation_error", "Некорректное действие.", 422);
  }

  if (payload.action === "block" && id === authorization.user.id) {
    return errorResponse("self_block_forbidden", "Нельзя заблокировать собственный аккаунт.", 409);
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      status: true
    }
  });

  if (!target) {
    return errorResponse("user_not_found", "Пользователь не найден.", 404);
  }

  const reason = payload.reason?.trim().slice(0, 500) || null;
  const nextStatus = payload.action === "block" ? "BLOCKED" : "ACTIVE";

  const user = await prisma.$transaction(async (transaction) => {
    const updatedUser = await transaction.user.update({
      where: { id },
      data: {
        status: nextStatus,
        blockedAt: payload.action === "block" ? new Date() : null,
        blockedReason: payload.action === "block" ? reason : null
      },
      select: {
        id: true,
        username: true,
        status: true,
        blockedAt: true,
        blockedReason: true
      }
    });

    await transaction.adminAuditLog.create({
      data: {
        actorId: authorization.user.id,
        action: payload.action === "block" ? "USER_BLOCKED" : "USER_UNBLOCKED",
        targetType: "USER",
        targetId: id,
        details: {
          username: target.username,
          reason
        }
      }
    });

    return updatedUser;
  });

  return successResponse({ user });
}
