import { isUuid } from "@/lib/api/validation";
import { authorizeActiveUser } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization.response;
  }

  const { id } = await params;

  if (!isUuid(id)) {
    return errorResponse("validation_error", "Некорректный идентификатор уведомления.", 422);
  }

  const notification = await prisma.notification.findFirst({
    where: { id, recipientId: authorization.user.id },
    select: { id: true, readAt: true }
  });

  if (!notification) {
    return errorResponse("notification_not_found", "Уведомление не найдено.", 404);
  }

  const readAt = notification.readAt ?? new Date();

  if (!notification.readAt) {
    await prisma.notification.update({ where: { id }, data: { readAt } });
  }

  return successResponse({ id, read_at: readAt });
}
