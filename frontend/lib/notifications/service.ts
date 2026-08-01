import type { NotificationType, Prisma } from "@/generated/prisma/client";

type Transaction = Prisma.TransactionClient;

type NotificationInput = {
  recipientId: string;
  actorId?: string | null;
  storyId?: string | null;
  commentId?: string | null;
  type: NotificationType;
  dedupeKey: string;
};

export function notificationDedupeKey(type: NotificationType, ...ids: string[]) {
  return [type.toLocaleLowerCase("en-US"), ...ids].join(":");
}

export function canNotify(recipientId: string, actorId?: string | null) {
  return !actorId || recipientId !== actorId;
}

async function createNotification(transaction: Transaction, input: NotificationInput) {
  if (!canNotify(input.recipientId, input.actorId)) {
    return false;
  }

  const result = await transaction.notification.createMany({
    data: [input],
    skipDuplicates: true
  });

  return result.count === 1;
}

export function notifyNewFollower(transaction: Transaction, followerId: string, authorId: string) {
  return createNotification(transaction, {
    recipientId: authorId,
    actorId: followerId,
    type: "NEW_FOLLOWER",
    dedupeKey: notificationDedupeKey("NEW_FOLLOWER", followerId, authorId)
  });
}

export function notifyStoryLiked(transaction: Transaction, actorId: string, recipientId: string, storyId: string) {
  return createNotification(transaction, {
    recipientId,
    actorId,
    storyId,
    type: "STORY_LIKED",
    dedupeKey: notificationDedupeKey("STORY_LIKED", actorId, storyId)
  });
}

export function notifyStoryCommented(transaction: Transaction, actorId: string, recipientId: string, storyId: string, commentId: string) {
  return createNotification(transaction, {
    recipientId,
    actorId,
    storyId,
    commentId,
    type: "STORY_COMMENTED",
    dedupeKey: notificationDedupeKey("STORY_COMMENTED", commentId)
  });
}

export function notifyCommentReplied(transaction: Transaction, actorId: string, recipientId: string, storyId: string, commentId: string) {
  return createNotification(transaction, {
    recipientId,
    actorId,
    storyId,
    commentId,
    type: "COMMENT_REPLIED",
    dedupeKey: notificationDedupeKey("COMMENT_REPLIED", commentId)
  });
}

export async function notifyAuthorPublished(transaction: Transaction, authorId: string, storyId: string) {
  const followers = await transaction.authorFollow.findMany({
    where: { authorId },
    select: { followerId: true }
  });

  if (followers.length === 0) {
    return 0;
  }

  const result = await transaction.notification.createMany({
    data: followers.map(({ followerId }) => ({
      recipientId: followerId,
      actorId: authorId,
      storyId,
      type: "AUTHOR_PUBLISHED" as const,
      dedupeKey: notificationDedupeKey("AUTHOR_PUBLISHED", followerId, storyId)
    })),
    skipDuplicates: true
  });

  return result.count;
}
