import { prisma } from "@/lib/prisma";

export async function getPublicStoryComments(storyId: string) {
  const story = await prisma.story.findFirst({
    where: {
      id: storyId,
      visibility: "PUBLIC"
    },
    select: {
      id: true,
      title: true,
      author: {
        select: { username: true }
      }
    }
  });

  if (!story) {
    return null;
  }

  const comments = await prisma.comment.findMany({
    where: {
      storyId,
      deletedAt: null,
      parentId: null
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });

  return { story, comments };
}
