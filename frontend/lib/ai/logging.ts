import { AIProviderRequestError, type AIOperation } from "@/lib/ai/types";

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
