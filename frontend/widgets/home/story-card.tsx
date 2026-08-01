import type { Work } from "@/entities/work/types";
import { StoryCard as SharedStoryCard } from "@/entities/work/components/story-card";

export function StoryCard({ work }: { work: Work }) {
  return <SharedStoryCard compact work={work} />;
}
