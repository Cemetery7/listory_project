export async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

type ApiErrorPayload = {
  error?: {
    message?: string;
  };
};

export async function readApiError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
  return payload?.error?.message ?? fallback;
}
