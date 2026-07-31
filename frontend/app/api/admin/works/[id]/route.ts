import { readJsonBody } from "@/lib/api/request";
import { authorizeAdmin } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

type WorkActionPayload = {
  action?: "hide" | "restore";
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdmin();

  if ("response" in authorization) {
    return authorization.response;
  }

  const payload = await readJsonBody<WorkActionPayload>(request);
  const { id } = await params;

  if (!payload || (payload.action !== "hide" && payload.action !== "restore")) {
    return errorResponse("validation_error", "Некорректное действие.", 422);
  }

  const target = await prisma.story.findUnique({
    where: { id },
    select: {
      id: true,
      title: true
    }
  });

  if (!target) {
    return errorResponse("story_not_found", "Произведение не найдено.", 404);
  }

  const visibility = payload.action === "hide" ? "HIDDEN" : "PUBLIC";

  const story = await prisma.$transaction(async (transaction) => {
    const updatedStory = await transaction.story.update({
      where: { id },
      data: { visibility },
      select: {
        id: true,
        title: true,
        visibility: true
      }
    });

    await transaction.adminAuditLog.create({
      data: {
        actorId: authorization.user.id,
        action: payload.action === "hide" ? "STORY_HIDDEN" : "STORY_RESTORED",
        targetType: "STORY",
        targetId: id,
        details: {
          title: target.title
        }
      }
    });

    return updatedStory;
  });

  return successResponse({ story });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdmin();

  if ("response" in authorization) {
    return authorization.response;
  }

  const { id } = await params;
  const target = await prisma.story.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      authorId: true
    }
  });

  if (!target) {
    return errorResponse("story_not_found", "Произведение не найдено.", 404);
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.story.delete({
      where: { id }
    });

    await transaction.adminAuditLog.create({
      data: {
        actorId: authorization.user.id,
        action: "STORY_DELETED",
        targetType: "STORY",
        targetId: id,
        details: {
          title: target.title,
          authorId: target.authorId
        }
      }
    });
  });

  return successResponse({ deleted: true });
}
