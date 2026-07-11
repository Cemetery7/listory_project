import { getCurrentUser } from "@/lib/auth/session";
import { errorResponse, successResponse } from "@/lib/auth/responses";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("unauthorized", "Unauthorized.", 401);
  }

  return successResponse({ user });
}
