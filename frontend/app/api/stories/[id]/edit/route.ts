import { authorizeStoryAuthor } from "@/lib/auth/authorization";
import { successResponse } from "@/lib/auth/responses";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const authorization = await authorizeStoryAuthor(id);

  if (!authorization.story) {
    return authorization.response;
  }

  const { story } = authorization;

  return successResponse({
    story: {
      id: story.id,
      title: story.title,
      description: story.description,
      status: story.status,
      cover: story.cover,
      visibility: story.visibility,
      chapters: story.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        content: chapter.content,
        order: chapter.order
      }))
    }
  });
}
