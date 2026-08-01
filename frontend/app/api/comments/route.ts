import { revalidatePath } from "next/cache";
import { readJsonBody } from "@/lib/api/request";
import { isUuid } from "@/lib/api/validation";
import { authorizeActiveUser } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";
import { notifyCommentReplied, notifyStoryCommented } from "@/lib/notifications/service";

type CreateCommentPayload = {
  story_id?: string;
  chapter_id?: string | null;
  parent_id?: string | null;
  content?: string;
};

export async function POST(request: Request) {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization.response;
  }

  const payload = await readJsonBody<CreateCommentPayload>(request);
  const storyId = payload?.story_id?.trim() ?? "";
  const chapterId = payload?.chapter_id?.trim() || null;
  const parentId = payload?.parent_id?.trim() || null;
  const content = payload?.content?.trim() ?? "";

  if (!isUuid(storyId) || (chapterId && !isUuid(chapterId)) || (parentId && !isUuid(parentId))) {
    return errorResponse("validation_error", "Некорректные данные комментария.", 422);
  }

  if (!content || content.length > 2000) {
    return errorResponse("validation_error", "Комментарий должен содержать от 1 до 2000 символов.", 422);
  }

  const story = await prisma.story.findFirst({
    where: { id: storyId, visibility: "PUBLIC", status: { in: ["ongoing", "completed"] }, author: { status: "ACTIVE" } },
    select: { id: true, authorId: true }
  });

  if (!story) {
    return errorResponse("story_not_found", "Произведение не найдено.", 404);
  }

  if (chapterId) {
    const chapterExists = await prisma.chapter.count({ where: { id: chapterId, storyId } });

    if (!chapterExists) {
      return errorResponse("chapter_not_found", "Глава не найдена.", 404);
    }
  }

  const parent = parentId
    ? await prisma.comment.findFirst({
        where: { id: parentId, storyId, deletedAt: null },
        select: { id: true, authorId: true }
      })
    : null;

  if (parentId && !parent) {
    return errorResponse("comment_not_found", "Родительский комментарий не найден.", 404);
  }

  const comment = await prisma.$transaction(async (transaction) => {
    const createdComment = await transaction.comment.create({
      data: {
        storyId,
        chapterId,
        parentId,
        authorId: authorization.user.id,
        content
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    if (parent) {
      await notifyCommentReplied(transaction, authorization.user.id, parent.authorId, storyId, createdComment.id);
    } else {
      await notifyStoryCommented(transaction, authorization.user.id, story.authorId, storyId, createdComment.id);
    }

    return createdComment;
  });

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/works/${storyId}`);
  revalidatePath(`/works/${storyId}/comments`);

  return successResponse(
    {
      comment: {
        id: comment.id,
        content: comment.content,
        created_at: comment.createdAt,
        author: comment.author
      }
    },
    { status: 201 }
  );
}
