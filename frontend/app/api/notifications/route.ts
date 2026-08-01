import { isUuid } from "@/lib/api/validation";
import { authorizeActiveUser } from "@/lib/auth/authorization";
import { errorResponse, successResponse } from "@/lib/auth/responses";
import { getNotifications } from "@/lib/notifications/queries";

export async function GET(request: Request) {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization.response;
  }

  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"));
  const cursor = searchParams.get("cursor")?.trim() || undefined;

  if (cursor && !isUuid(cursor)) {
    return errorResponse("validation_error", "Некорректный курсор.", 422);
  }

  const data = await getNotifications(authorization.user.id, {
    limit,
    cursor,
    unread: searchParams.get("unread") === "true"
  });

  return successResponse(data);
}

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "10", 10);
  return Number.isFinite(parsed) ? Math.min(50, Math.max(1, parsed)) : 10;
}
