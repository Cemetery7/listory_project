import { revalidatePath } from "next/cache";
import { isUuid } from "@/lib/api/validation";
import { authorizeActiveUser } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { notifyNewFollower } from "@/lib/notifications/service";
import { prisma } from "@/lib/prisma";
import { isSelfFollow } from "@/lib/authors/follows";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  return updateFollow((await context.params).id, true);
}

export async function DELETE(_request: Request, context: RouteContext) {
  return updateFollow((await context.params).id, false);
}

async function updateFollow(authorId: string, following: boolean) {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization.response;
  }

  if (!isUuid(authorId)) {
    return errorResponse("validation_error", "Некорректный идентификатор автора.", 422);
  }

  if (isSelfFollow(authorization.user.id, authorId)) {
    return errorResponse("self_follow", "Нельзя отслеживать самого себя.", 409);
  }

  const author = await prisma.user.findFirst({
    where: { id: authorId, status: "ACTIVE" },
    select: { id: true }
  });

  if (!author) {
    return errorResponse("author_not_found", "Автор не найден.", 404);
  }

  const result = await prisma.$transaction(async (transaction) => {
    if (following) {
      const created = await transaction.authorFollow.createMany({
        data: [{ followerId: authorization.user.id, authorId }],
        skipDuplicates: true
      });

      if (created.count === 1) {
        await notifyNewFollower(transaction, authorization.user.id, authorId);
      }
    } else {
      await transaction.authorFollow.deleteMany({
        where: { followerId: authorization.user.id, authorId }
      });
    }

    return transaction.authorFollow.count({ where: { authorId } });
  });

  revalidatePath(`/authors/${authorId}`);

  return successResponse({ following, followers_count: result });
}
