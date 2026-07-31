import { revalidatePath } from "next/cache";
import { authorizeActiveUser } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { isUuid } from "@/lib/api/validation";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return setLike(await params, true);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return setLike(await params, false);
}

async function setLike({ id }: { id: string }, liked: boolean) {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization.response;
  }

  if (!isUuid(id)) {
    return errorResponse("validation_error", "Некорректный идентификатор произведения.", 422);
  }

  const story = await prisma.story.findFirst({
    where: { id, visibility: "PUBLIC" },
    select: { id: true }
  });

  if (!story) {
    return errorResponse("story_not_found", "Произведение не найдено.", 404);
  }

  const likesCount = await prisma.$transaction(async (transaction) => {
    if (liked) {
      await transaction.storyLike.upsert({
        where: {
          userId_storyId: {
            userId: authorization.user.id,
            storyId: id
          }
        },
        update: {},
        create: {
          userId: authorization.user.id,
          storyId: id
        }
      });
    } else {
      await transaction.storyLike.deleteMany({
        where: {
          userId: authorization.user.id,
          storyId: id
        }
      });
    }

    return transaction.storyLike.count({ where: { storyId: id } });
  });

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/works/${id}`);

  return successResponse({ liked, likes_count: likesCount });
}
