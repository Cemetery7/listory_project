import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { errorResponse } from "@/lib/auth/responses";

type CreateStoryPayload = {
  title?: string;
  description?: string;
  status?: string;
  cover?: string | null;
  chapterTitle?: string;
  chapterContent?: string;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("unauthorized", "Unauthorized.", 401);
  }

  const payload = await readJsonBody<CreateStoryPayload>(request);

  if (!payload) {
    return errorResponse("invalid_json", "Некорректный запрос.", 400);
  }

  const title = payload.title?.trim();
  const description = payload.description?.trim();
  const chapterTitle = payload.chapterTitle?.trim() || "Глава 1";
  const chapterContent = payload.chapterContent?.trim();
  const status = normalizeStatus(payload.status);

  if (!title) {
    return errorResponse("validation_error", "Название обязательно.", 422);
  }

  if (!description) {
    return errorResponse("validation_error", "Описание обязательно.", 422);
  }

  if (!chapterContent) {
    return errorResponse("validation_error", "Первая глава обязательна.", 422);
  }

  try {
    const story = await prisma.$transaction(async (transaction) => {
      const createdStory = await transaction.story.create({
        data: {
          title,
          description,
          status,
          cover: payload.cover ?? null,
          authorId: user.id
        }
      });

      await transaction.chapter.create({
        data: {
          storyId: createdStory.id,
          title: chapterTitle,
          content: chapterContent,
          order: 1
        }
      });

      return createdStory;
    });

    return NextResponse.json({ data: { story: { id: story.id } } }, { status: 201 });
  } catch {
    return errorResponse("story_publish_failed", "Не удалось опубликовать произведение. Попробуйте позже.", 500);
  }
}

function normalizeStatus(status?: string) {
  if (status === "completed") {
    return "completed";
  }

  if (status === "draft") {
    return "draft";
  }

  return "ongoing";
}
