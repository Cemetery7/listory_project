"use client";

import { useEffect, useRef } from "react";

export function StoryViewTracker({ storyId }: { storyId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    void fetch(`/api/stories/${storyId}/view`, {
      method: "POST",
      keepalive: true
    }).catch(() => undefined);
  }, [storyId]);

  return null;
}
