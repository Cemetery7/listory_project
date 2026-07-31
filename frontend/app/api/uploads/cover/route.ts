import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { authorizeActiveUser } from "@/lib/auth/authorization";
import { errorResponse } from "@/lib/auth/responses";

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp"];
const maximumSizeInBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const authorization = await authorizeActiveUser();

  if ("response" in authorization) {
    return authorization.response;
  }

  const user = authorization.user;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return errorResponse("cover_upload_unavailable", "Загрузка обложек временно недоступна.", 503);
  }

  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return errorResponse("invalid_json", "Некорректный запрос загрузки.", 400);
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("covers/")) {
          throw new Error("Недопустимый путь загрузки.");
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes,
          addRandomSuffix: true,
          tokenPayload: user.id
        };
      }
    });

    return NextResponse.json(response);
  } catch {
    return errorResponse("cover_upload_failed", "Не удалось загрузить обложку.", 400);
  }
}
