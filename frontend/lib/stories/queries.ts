import type { Work } from "@/entities/work/types";
import { prisma } from "@/lib/prisma";
import { isStoryStatus, storyStatusLabel } from "@/lib/stories/status";

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
  _count: {
    likes: number;
    comments: number;
    views: number;
  };
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
    status: isStoryStatus(story.status) ? story.status : "ongoing",
    rating: 0,
    views: String(story._count.views),
    likes: String(story._count.likes),
    commentsCount: story._count.comments,
    chaptersCount: story.chapters.length,
    tags: [isStoryStatus(story.status) ? storyStatusLabel(story.status).toLocaleLowerCase("ru-RU") : "в работе"],
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
      },
      _count: {
        select: {
          likes: true,
          views: true,
          comments: {
            where: { deletedAt: null }
          }
        }
      }
    }
  });

  return stories.map(mapStoryToWork);
}

export async function getStoryById(id: string, viewerId?: string) {
  return prisma.story.findFirst({
    where: {
      id,
      visibility: "PUBLIC",
      status: { in: ["ongoing", "completed"] }
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
      },
      likes: {
        where: {
          userId: viewerId ?? "00000000-0000-0000-0000-000000000000"
        },
        select: {
          userId: true
        }
      },
      _count: {
        select: {
          likes: true,
          views: true,
          comments: {
            where: { deletedAt: null }
          }
        }
      }
    }
  });
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
