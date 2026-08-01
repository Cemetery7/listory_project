import { authorizeActiveUser } from "@/lib/auth/authorization";
import { successResponse } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization.response;
  }

  const readAt = new Date();
  const result = await prisma.notification.updateMany({
    where: { recipientId: authorization.user.id, readAt: null },
    data: { readAt }
  });

  return successResponse({ updated_count: result.count, read_at: readAt });
}
