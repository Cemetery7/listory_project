import { KodikProvider } from "@/lib/ai/kodik-provider";
import type { AIProvider } from "@/lib/ai/types";

let provider: AIProvider | null = null;

export function getAIProvider() {
  provider ??= new KodikProvider();
  return provider;
}
