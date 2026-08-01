import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import { isSelfFollow } from "@/lib/authors/follows";
import { publicAuthorStoryFilter } from "@/lib/authors/queries";
import { notificationRecipientWhere } from "@/lib/notifications/queries";
import { canNotify, notificationDedupeKey, notifyAuthorPublished, notifyCommentReplied, notifyStoryCommented, notifyStoryLiked } from "@/lib/notifications/service";

type NotificationData = { dedupeKey: string; recipientId: string; actorId?: string | null; storyId?: string | null; commentId?: string | null; type: string };

function createTransaction(followerIds: string[] = []) {
  const stored = new Set<string>();
  const notifications: NotificationData[] = [];
  const transaction = {
    authorFollow: {
      findMany: async () => followerIds.map((followerId) => ({ followerId }))
    },
    notification: {
      createMany: async ({ data }: { data: NotificationData[] }) => {
        let count = 0;
        for (const item of data) {
          if (stored.has(item.dedupeKey)) continue;
          stored.add(item.dedupeKey);
          notifications.push(item);
          count += 1;
        }
        return { count };
      }
    }
  } as unknown as Prisma.TransactionClient;

  return { transaction, notifications };
}

test("dedupe keys are stable and self-follow/self-notification are rejected", () => {
  assert.equal(notificationDedupeKey("STORY_LIKED", "reader", "story"), "story_liked:reader:story");
  assert.equal(isSelfFollow("user", "user"), true);
  assert.equal(isSelfFollow("reader", "author"), false);
  assert.equal(canNotify("user", "user"), false);
});

test("a like creates one notification and a repeated like does not duplicate it", async () => {
  const { transaction, notifications } = createTransaction();
  assert.equal(await notifyStoryLiked(transaction, "reader", "author", "story"), true);
  assert.equal(await notifyStoryLiked(transaction, "reader", "author", "story"), false);
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].type, "STORY_LIKED");
});

test("comments and replies target the expected recipient and keep distinct dedupe keys", async () => {
  const { transaction, notifications } = createTransaction();
  await notifyStoryCommented(transaction, "reader", "author", "story", "comment-1");
  await notifyCommentReplied(transaction, "author", "reader", "story", "comment-2");
  assert.deepEqual(notifications.map(({ recipientId, type }) => ({ recipientId, type })), [
    { recipientId: "author", type: "STORY_COMMENTED" },
    { recipientId: "reader", type: "COMMENT_REPLIED" }
  ]);
});

test("first publication notifies every follower once", async () => {
  const { transaction, notifications } = createTransaction(["reader-1", "reader-2"]);
  assert.equal(await notifyAuthorPublished(transaction, "author", "story"), 2);
  assert.equal(await notifyAuthorPublished(transaction, "author", "story"), 0);
  assert.equal(notifications.length, 2);
});

test("notification queries are scoped to the recipient and author works are public only", () => {
  assert.deepEqual(notificationRecipientWhere("current-user", true), { recipientId: "current-user", readAt: null });
  assert.deepEqual(publicAuthorStoryFilter(), { visibility: "PUBLIC", status: { in: ["ongoing", "completed"] } });
});
