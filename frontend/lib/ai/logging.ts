import { AIProviderRequestError, type AIOperation } from "@/lib/ai/types";

export type AIProviderAttempt = {
  operation: AIOperation;
  status?: number;
  durationMs: number;
  model?: string;
  parseSuccess: boolean;
  retried: boolean;
};

export function logAIProviderAttempt(attempt: AIProviderAttempt) {
  console.info("AI provider attempt", {
    operation: attempt.operation,
    providerStatus: Number.isInteger(attempt.status) ? attempt.status : undefined,
    durationMs: Math.max(0, Math.round(attempt.durationMs)),
    model: normalizeModelId(attempt.model),
    parseSuccess: attempt.parseSuccess,
    retried: attempt.retried
  });
}

export function logUnknownAIError(error: unknown, operation: AIOperation) {
  const name = readSafeErrorName(error);
  const providerStatus = readProviderStatus(error);

  console.error("Unknown AI error", {
    name,
    message: error instanceof AIProviderRequestError ? error.message : "Unexpected AI failure.",
    providerStatus,
    operation
  });
}

function readSafeErrorName(error: unknown) {
  if (!(error instanceof Error) || !/^[A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(error.name)) {
    return "UnknownError";
  }

  return error.name;
}

function readProviderStatus(error: unknown) {
  if (!(error instanceof AIProviderRequestError) || !Number.isInteger(error.status)) {
    return undefined;
  }

  return error.status;
}

function normalizeModelId(model?: string) {
  const value = model?.trim();
  return value && /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/.test(value) ? value : undefined;
}
