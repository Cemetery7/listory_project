import type { Work, WorkStatus } from "@/entities/work/types";
import { prisma } from "@/lib/prisma";

const coverClasses = ["cover-aurora", "cover-neon", "cover-coast", "cover-spring"];

export type StorySort = "new" | "updated";

export type StoryQuery = {
  query?: string;
  status?: "ongoing" | "completed";
  sort?: StorySort;
};

type StoryWithAuthorAndChapters = {
  id: string;
  title: string;
  description: string;
  cover: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    username: string;
  };
  chapters: Array<{
    id: string;
    title: string;
    order: number;
    createdAt: Date;
  }>;
};

export function mapStoryToWork(story: StoryWithAuthorAndChapters): Work {
  const coverUrl = isStoryCoverUrl(story.cover) ? story.cover : null;

  return {
    id: story.id,
    title: story.title,
    slug: story.id,
    description: story.description,
    coverUrl,
    coverClass: coverUrl ? coverClasses[0] : story.cover ?? coverClasses[Math.abs(hashId(story.id)) % coverClasses.length],
    author: story.author.username,
    category: "Оригинальные",
    fandom: "Авторский мир",
    status: normalizeStatus(story.status),
    rating: 0,
    views: "0",
    likes: "0",
    commentsCount: 0,
    chaptersCount: story.chapters.length,
    tags: [statusLabel(story.status)],
    updatedAt: formatRelativeDate(story.updatedAt)
  };
}

export function isStoryCoverUrl(cover: string | null): cover is string {
  if (!cover) {
    return false;
  }

  try {
    const url = new URL(cover);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function getPublishedStories(options: StoryQuery = {}) {
  const query = options.query?.trim();
  const stories = await prisma.story.findMany({
    where: {
      visibility: "PUBLIC",
      status: options.status ?? { in: ["ongoing", "completed"] },
      ...(query
        ? {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive" as const
                }
              },
              {
                author: {
                  username: {
                    contains: query,
                    mode: "insensitive" as const
                  }
                }
              }
            ]
          }
        : {})
    },
    orderBy: options.sort === "updated" ? { updatedAt: "desc" } : { createdAt: "desc" },
    include: {
      author: {
        select: { username: true }
      },
      chapters: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          createdAt: true
        }
      }
    }
  });

  return stories.map(mapStoryToWork);
}

export async function getStoryById(id: string) {
  return prisma.story.findFirst({
    where: {
      id,
      visibility: "PUBLIC"
    },
    include: {
      author: {
        select: {
          username: true
        }
      },
      chapters: {
        orderBy: {
          order: "asc"
        }
      }
    }
  });
}

function normalizeStatus(status: string): WorkStatus {
  if (status === "completed") {
    return "completed";
  }

  if (status === "draft") {
    return "draft";
  }

  return "ongoing";
}

function statusLabel(status: string) {
  if (status === "completed") {
    return "завершено";
  }

  if (status === "draft") {
    return "черновик";
  }

  return "в процессе";
}

function formatRelativeDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function hashId(id: string) {
  return id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}
