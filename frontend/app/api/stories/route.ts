import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request";
import { prisma } from "@/lib/prisma";
import { authorizeActiveUser } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { getPublishedStories, type StorySort } from "@/lib/stories/queries";
import { parseStoryEditorPayload } from "@/lib/stories/editor";
import { isStoryStatus } from "@/lib/stories/status";

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
  const payload = await readJsonBody<unknown>(request);

  if (!payload) {
    return errorResponse("invalid_json", "Некорректный запрос.", 400);
  }

  const parsed = parseStoryEditorPayload(payload);

  if ("error" in parsed) {
    return errorResponse("validation_error", parsed.error, 422);
  }

  const { title, description, status, cover, chapters } = parsed.data;

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

      await transaction.chapter.createMany({
        data: chapters.map((chapter, index) => ({
          storyId: createdStory.id,
          title: chapter.title,
          content: chapter.content,
          order: index + 1
        }))
      });

      return createdStory;
    });

    return NextResponse.json({ data: { story: { id: story.id } } }, { status: 201 });
  } catch {
    return errorResponse("story_publish_failed", "Не удалось опубликовать произведение. Попробуйте позже.", 500);
  }
}

function normalizeCatalogStatus(status: string | null) {
  if (isStoryStatus(status) && status !== "draft") {
    return status;
  }

  return undefined;
}

function normalizeSort(sort: string | null): StorySort {
  return sort === "updated" ? "updated" : "new";
}
