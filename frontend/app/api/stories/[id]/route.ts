import { revalidatePath } from "next/cache";
import { readJsonBody } from "@/lib/api/request";
import { authorizeStoryAuthor } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";
import { parseStoryEditorPayload } from "@/lib/stories/editor";
import { notifyAuthorPublished } from "@/lib/notifications/service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const authorization = await authorizeStoryAuthor(id);

  if (!authorization.story) {
    return authorization.response;
  }

  const payload = await readJsonBody<unknown>(request);

  if (!payload) {
    return errorResponse("invalid_json", "Некорректный запрос.", 400);
  }

  const parsed = parseStoryEditorPayload(payload);

  if ("error" in parsed) {
    return errorResponse("validation_error", parsed.error, 422);
  }

  const existingIds = new Set(authorization.story.chapters.map((chapter) => chapter.id));

  if (parsed.data.chapters.some((chapter) => chapter.id && !existingIds.has(chapter.id))) {
    return errorResponse("chapter_not_found", "Одна из глав не принадлежит этому произведению.", 404);
  }

  try {
    await prisma.$transaction(async (transaction) => {
      for (const [index, chapter] of authorization.story.chapters.entries()) {
        await transaction.chapter.update({
          where: { id: chapter.id },
          data: { order: -(index + 1) }
        });
      }

      const retainedIds = parsed.data.chapters.flatMap((chapter) => (chapter.id ? [chapter.id] : []));

      await transaction.chapter.deleteMany({
        where: {
          storyId: id,
          ...(retainedIds.length ? { id: { notIn: retainedIds } } : {})
        }
      });

      for (const [index, chapter] of parsed.data.chapters.entries()) {
        if (chapter.id) {
          await transaction.chapter.update({
            where: { id: chapter.id },
            data: {
              title: chapter.title,
              content: chapter.content,
              order: index + 1
            }
          });
        } else {
          await transaction.chapter.create({
            data: {
              storyId: id,
              title: chapter.title,
              content: chapter.content,
              order: index + 1
            }
          });
        }
      }

      await transaction.story.update({
        where: { id },
        data: {
          title: parsed.data.title,
          description: parsed.data.description,
          status: parsed.data.status,
          cover: parsed.data.cover
        }
      });

      const wasPublished = authorization.story.visibility === "PUBLIC" && ["ongoing", "completed"].includes(authorization.story.status);
      const isPublished = authorization.story.visibility === "PUBLIC" && ["ongoing", "completed"].includes(parsed.data.status);

      if (!wasPublished && isPublished) {
        await notifyAuthorPublished(transaction, authorization.user.id, id);
      }
    });

    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/my-works");
    revalidatePath(`/works/${id}`);
    revalidatePath(`/works/${id}/edit`);
    revalidatePath(`/authors/${authorization.user.id}`);

    return successResponse({ story: { id } });
  } catch {
    return errorResponse("story_update_failed", "Не удалось сохранить изменения. Попробуйте позже.", 500);
  }
}
