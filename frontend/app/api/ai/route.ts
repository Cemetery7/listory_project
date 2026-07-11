import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request";
import { errorResponse } from "@/lib/auth/responses";
import { AI_CONFIG } from "@/lib/ai/config";
import { getAIProvider } from "@/lib/ai/provider";
import { checkAIRateLimit } from "@/lib/ai/rate-limit";
import { AITimeoutError, AIUnavailableError, type AIOperation, type AIRequestInput, type AIResult } from "@/lib/ai/types";

type AIPayload = AIRequestInput & {
  operation?: AIOperation;
};

export async function POST(request: Request) {
  const payload = await readJsonBody<AIPayload>(request);

  if (!payload) {
    return errorResponse("invalid_json", "Некорректный запрос.", 400);
  }

  const operation = payload.operation;

  if (!isAIOperation(operation)) {
    return errorResponse("validation_error", "Не выбрана AI-операция.", 422);
  }

  const input = sanitizePayload(payload);
  const validationError = validatePayload(operation, input);

  if (validationError) {
    return errorResponse("validation_error", validationError, 422);
  }

  const rateLimit = checkAIRateLimit(getClientKey(request), operation);

  if (!rateLimit.allowed) {
    return errorResponse("rate_limited", "Слишком много AI-запросов. Попробуйте немного позже.", 429);
  }

  try {
    const provider = getAIProvider();
    const result = await runOperation(provider, operation, input);

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      return errorResponse("ai_unavailable", error.message, 503);
    }

    if (error instanceof AITimeoutError) {
      return errorResponse("ai_timeout", error.message, 504);
    }

    return errorResponse("ai_failed", "AI не смог подготовить ответ. Попробуйте позже.", 502);
  }
}

async function runOperation(provider: ReturnType<typeof getAIProvider>, operation: AIOperation, input: AIRequestInput): Promise<AIResult> {
  if (operation === "title") {
    return {
      operation,
      suggestions: await provider.suggestTitles(input)
    };
  }

  if (operation === "description") {
    return {
      operation,
      suggestion: await provider.improveDescription(input)
    };
  }

  if (operation === "tags") {
    return {
      operation,
      suggestions: await provider.suggestTags(input)
    };
  }

  return {
    operation,
    suggestion: await provider.continueChapter(input)
  };
}

function validatePayload(operation: AIOperation, payload: AIRequestInput) {
  if (operation === "description" && !payload.description?.trim()) {
    return "Сначала напишите хотя бы несколько слов описания.";
  }

  if (operation === "tags" && !payload.title?.trim() && !payload.description?.trim()) {
    return "Для подбора тегов добавьте название или описание.";
  }

  if (operation === "continue" && !payload.chapterText?.trim()) {
    return "Сначала напишите несколько строк главы.";
  }

  return "";
}

function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function isAIOperation(operation?: string): operation is AIOperation {
  return operation === "title" || operation === "description" || operation === "tags" || operation === "continue";
}

function sanitizePayload(payload: AIRequestInput): AIRequestInput {
  return {
    title: payload.title?.slice(0, AI_CONFIG.TITLE_INPUT_MAX_CHARS),
    description: payload.description?.slice(0, AI_CONFIG.DESCRIPTION_INPUT_MAX_CHARS),
    genres: payload.genres?.slice(0, AI_CONFIG.TAG_LIMIT).map((genre) => genre.slice(0, AI_CONFIG.TITLE_INPUT_MAX_CHARS)),
    tags: payload.tags?.slice(0, AI_CONFIG.TAG_LIMIT).map((tag) => tag.slice(0, AI_CONFIG.TITLE_INPUT_MAX_CHARS)),
    chapterText: payload.chapterText?.slice(-AI_CONFIG.MAX_CONTEXT_CHARS)
  };
}
