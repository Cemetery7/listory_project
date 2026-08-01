import { mapStoryToWork } from "@/lib/stories/queries";
import { prisma } from "@/lib/prisma";

export function publicAuthorStoryFilter() {
  return {
    visibility: "PUBLIC" as const,
    status: { in: ["ongoing", "completed"] }
  };
}

export async function getPublicAuthor(authorId: string, viewerId?: string) {
  const author = await prisma.user.findFirst({
    where: {
      id: authorId,
      status: "ACTIVE"
    },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          stories: {
            where: publicAuthorStoryFilter()
          }
        }
      },
      stories: {
        where: publicAuthorStoryFilter(),
        orderBy: { updatedAt: "desc" },
        include: {
          author: {
            select: { id: true, username: true, avatar: true }
          },
          chapters: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true, createdAt: true }
          },
          _count: {
            select: {
              likes: true,
              views: true,
              comments: { where: { deletedAt: null } }
            }
          }
        }
      }
    }
  });

  if (!author) {
    return null;
  }

  const [likesCount, following] = await Promise.all([
    prisma.storyLike.count({
      where: {
        story: {
          authorId,
          ...publicAuthorStoryFilter()
        }
      }
    }),
    viewerId && viewerId !== authorId
      ? prisma.authorFollow.count({ where: { followerId: viewerId, authorId } }).then(Boolean)
      : Promise.resolve(false)
  ]);

  return {
    id: author.id,
    username: author.username,
    avatar: author.avatar,
    bio: author.bio,
    createdAt: author.createdAt,
    followersCount: author._count.followers,
    followingCount: author._count.following,
    storiesCount: author._count.stories,
    likesCount,
    following,
    stories: author.stories.map(mapStoryToWork)
  };
}
