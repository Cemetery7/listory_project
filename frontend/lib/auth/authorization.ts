import { isUuid } from "@/lib/api/validation";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { clearAuthCookie } from "./cookies";
import { errorResponse } from "./responses";
import { getCurrentUser } from "./session";

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
type AuthorizationResult =
  | { user: CurrentUser; response?: never }
  | { response: Response; user?: never };
type AuthorizedStory = Prisma.StoryGetPayload<{ include: { chapters: true } }>;
type StoryAuthorizationResult =
  | { user: CurrentUser; story: AuthorizedStory; response?: never }
  | { response: Response; user?: never; story?: never };

export async function authorizeActiveUser(): Promise<AuthorizationResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: errorResponse("unauthorized", "Требуется авторизация.", 401)
    };
  }

  if (user.status === "BLOCKED") {
    const response = errorResponse("account_blocked", "Аккаунт заблокирован.", 403);
    clearAuthCookie(response);

    return { response };
  }

  return { user };
}

export async function authorizeAdmin() {
  const authorization = await authorizeActiveUser();

  if (!authorization.user) {
    return authorization;
  }

  if (authorization.user.role !== "ADMIN") {
    return {
      response: errorResponse("forbidden", "Недостаточно прав.", 403)
    } as const;
  }

  return authorization;
}

export async function authorizeStoryAuthor(storyId: string): Promise<StoryAuthorizationResult> {
  const authorization = await authorizeActiveUser();

  if (!authorization.user) {
    return authorization;
  }

  if (!isUuid(storyId)) {
    return {
      response: errorResponse("validation_error", "Некорректный идентификатор произведения.", 422)
    } as const;
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      chapters: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!story || story.authorId !== authorization.user.id) {
    return {
      response: errorResponse("story_not_found", "Произведение не найдено.", 404)
    } as const;
  }

  return {
    user: authorization.user,
    story
  } as const;
}
