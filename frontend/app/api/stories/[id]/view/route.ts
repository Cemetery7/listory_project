import { isUuid } from "@/lib/api/validation";
import { authorizeActiveUser } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authorization = await authorizeActiveUser();

  if (!authorization.user) {
    return authorization.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return errorResponse("validation_error", "Некорректный идентификатор произведения.", 422);
  }

  try {
    const story = await prisma.story.findFirst({
      where: {
        id,
        visibility: "PUBLIC",
        status: { in: ["ongoing", "completed"] }
      },
      select: {
        id: true,
        authorId: true,
        _count: {
          select: { views: true }
        }
      }
    });

    if (!story) {
      return errorResponse("story_not_found", "Произведение не найдено.", 404);
    }

    if (story.authorId === authorization.user.id) {
      return successResponse({ views: story._count.views });
    }

    const [, views] = await prisma.$transaction([
      prisma.storyView.upsert({
        where: {
          storyId_viewerId: {
            storyId: story.id,
            viewerId: authorization.user.id
          }
        },
        update: {},
        create: {
          storyId: story.id,
          viewerId: authorization.user.id
        }
      }),
      prisma.storyView.count({
        where: { storyId: story.id }
      })
    ]);

    return successResponse({ views });
  } catch {
    return errorResponse("view_registration_failed", "Не удалось обновить статистику просмотров.", 500);
  }
}
