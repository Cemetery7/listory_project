export const STORY_STATUSES = ["draft", "ongoing", "completed"] as const;

export type StoryStatus = (typeof STORY_STATUSES)[number];

export function isStoryStatus(value: unknown): value is StoryStatus {
  return typeof value === "string" && STORY_STATUSES.includes(value as StoryStatus);
}

export function storyStatusLabel(status: StoryStatus) {
  if (status === "draft") return "Черновик";
  if (status === "completed") return "Завершено";
  return "В работе";
}
