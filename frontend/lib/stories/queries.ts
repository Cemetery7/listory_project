import type { Work, WorkStatus } from "@/entities/work/types";
import { prisma } from "@/lib/prisma";

const coverClasses = ["cover-aurora", "cover-neon", "cover-coast", "cover-spring"];

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
  return {
    id: story.id,
    title: story.title,
    slug: story.id,
    description: story.description,
    coverClass: story.cover ?? coverClasses[Math.abs(hashId(story.id)) % coverClasses.length],
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

export async function getPublishedStories() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
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
  return prisma.story.findUnique({
    where: { id },
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
