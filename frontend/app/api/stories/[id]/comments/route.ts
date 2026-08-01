import { getPublicStoryComments } from "@/lib/comments/queries";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { isUuid } from "@/lib/api/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isUuid(id)) {
    return errorResponse("validation_error", "Некорректный идентификатор произведения.", 422);
  }

  const result = await getPublicStoryComments(id);

  if (!result) {
    return errorResponse("story_not_found", "Произведение не найдено.", 404);
  }

  return successResponse({
    comments: result.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
      author: comment.author,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        created_at: reply.createdAt,
        updated_at: reply.updatedAt,
        author: reply.author
      }))
    }))
  });
}
