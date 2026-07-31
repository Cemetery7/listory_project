import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request";
import { prisma } from "@/lib/prisma";
import { authorizeActiveUser } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { getPublishedStories, type StorySort } from "@/lib/stories/queries";

type CreateStoryPayload = {
  title?: string;
  description?: string;
  status?: string;
  cover?: string | null;
  chapterTitle?: string;
  chapterContent?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const status = normalizeCatalogStatus(searchParams.get("status"));
  const sort = normalizeSort(searchParams.get("sort"));

  try {
    const stories = await getPublishedStories({
      query: query || undefined,
      status,
      sort
    });

    return successResponse({ stories });
  } catch {
    return errorResponse("stories_load_failed", "Не удалось загрузить произведения.", 500);
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization.response;
  }

  const user = authorization.user;
  const payload = await readJsonBody<CreateStoryPayload>(request);

  if (!payload) {
    return errorResponse("invalid_json", "Некорректный запрос.", 400);
  }

  const title = payload.title?.trim();
  const description = payload.description?.trim();
  const chapterTitle = payload.chapterTitle?.trim() || "Глава 1";
  const chapterContent = payload.chapterContent?.trim();
  const status = normalizeStatus(payload.status);
  const cover = normalizeCover(payload.cover);

  if (!title) {
    return errorResponse("validation_error", "Название обязательно.", 422);
  }

  if (!description) {
    return errorResponse("validation_error", "Описание обязательно.", 422);
  }

  if (!chapterContent) {
    return errorResponse("validation_error", "Первая глава обязательна.", 422);
  }

  if (payload.cover && !cover) {
    return errorResponse("validation_error", "Некорректный URL обложки.", 422);
  }

  try {
    const story = await prisma.$transaction(async (transaction) => {
      const createdStory = await transaction.story.create({
        data: {
          title,
          description,
          status,
          cover,
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

function normalizeCover(cover?: string | null) {
  if (!cover) {
    return null;
  }

  try {
    const url = new URL(cover);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com") ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeCatalogStatus(status: string | null) {
  if (status === "ongoing" || status === "completed") {
    return status;
  }

  return undefined;
}

function normalizeSort(sort: string | null): StorySort {
  return sort === "updated" ? "updated" : "new";
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
