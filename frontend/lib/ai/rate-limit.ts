import { AI_CONFIG } from "@/lib/ai/config";
import type { AIOperation } from "@/lib/ai/types";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkAIRateLimit(clientKey: string, operation: AIOperation) {
  const now = Date.now();
  const key = `${clientKey}:${operation}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + AI_CONFIG.RATE_LIMIT_WINDOW_MS
    });

    return { allowed: true };
  }

  if (bucket.count >= AI_CONFIG.RATE_LIMIT_PER_MINUTE) {
    return {
      allowed: false,
      retryAfterMs: bucket.resetAt - now
    };
  }

  bucket.count += 1;
  return { allowed: true };
}
