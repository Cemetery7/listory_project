"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { AI_CONFIG } from "@/lib/ai/config";
import type { AIResult, AIOperation } from "@/lib/ai/types";
import { Button } from "@/shared/ui/button";

export async function fetchAI(payload: {
  operation: AIOperation;
  title?: string;
  description?: string;
  genres?: string[];
  tags?: string[];
  chapterText?: string;
}) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = (await response.json()) as { data?: AIResult; error?: { message: string } };

  if (!response.ok || !result.data) {
    throw new Error(result.error?.message ?? "AI временно недоступен.");
  }

  return result.data;
}

export function useAICooldown() {
  const [cooldowns, setCooldowns] = useState<Record<AIOperation, number>>({
    title: 0,
    description: 0,
    tags: 0,
    continue: 0
  });

  useEffect(() => {
    if (!Object.values(cooldowns).some(Boolean)) return;

    const intervalId = window.setInterval(() => {
      setCooldowns((current) => ({
        title: Math.max(current.title - 1, 0),
        description: Math.max(current.description - 1, 0),
        tags: Math.max(current.tags - 1, 0),
        continue: Math.max(current.continue - 1, 0)
      }));
    }, AI_CONFIG.COOLDOWN_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [cooldowns]);

  const startCooldown = (operation: AIOperation) => {
    setCooldowns((current) => ({
      ...current,
      [operation]: Math.ceil(AI_CONFIG.AI_COOLDOWN_MS / 1000)
    }));
  };

  return { cooldowns, startCooldown };
}

export function AISuggestionPanel({ actionLabel, children, onApply }: { actionLabel: string; children: string; onApply: () => void }) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-4">
      <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">{children}</p>
      <Button size="sm" type="button" variant="secondary" onClick={onApply}>
        <Check size={15} />
        {actionLabel}
      </Button>
    </div>
  );
}
