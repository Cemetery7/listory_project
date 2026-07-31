import { authorizeActiveUser } from "@/lib/auth/authorization";
import { successResponse } from "@/lib/auth/responses";

export async function GET() {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization.response;
  }

  return successResponse({ user: authorization.user });
}
