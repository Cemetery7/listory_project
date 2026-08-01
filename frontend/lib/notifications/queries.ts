import type { NotificationType } from "@/generated/prisma/enums";
import { ROUTES } from "@/constants/routes";
import { prisma } from "@/lib/prisma";
import type { NotificationItem, NotificationsResponse } from "./types";

type NotificationRecord = {
  id: string;
  type: NotificationType;
  readAt: Date | null;
  createdAt: Date;
  actor: {
    id: string;
    username: string;
    avatar: string | null;
    status: "ACTIVE" | "BLOCKED";
  } | null;
  story: {
    id: string;
    title: string;
    status: string;
    visibility: "PUBLIC" | "HIDDEN";
  } | null;
};

export async function getNotifications(recipientId: string, options: { limit: number; cursor?: string; unread?: boolean }): Promise<NotificationsResponse> {
  const records = await prisma.notification.findMany({
    where: notificationRecipientWhere(recipientId, options.unread),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: options.limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      type: true,
      readAt: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          username: true,
          avatar: true,
          status: true
        }
      },
      story: {
        select: {
          id: true,
          title: true,
          status: true,
          visibility: true
        }
      }
    }
  });
  const hasMore = records.length > options.limit;
  const visibleRecords = hasMore ? records.slice(0, options.limit) : records;
  const unreadCount = await prisma.notification.count({ where: { recipientId, readAt: null } });

  return {
    notifications: visibleRecords.map(formatNotification),
    unread_count: unreadCount,
    next_cursor: hasMore ? visibleRecords.at(-1)?.id ?? null : null
  };
}

export function notificationRecipientWhere(recipientId: string, unread = false) {
  return {
    recipientId,
    ...(unread ? { readAt: null } : {})
  };
}

export function formatNotification(record: NotificationRecord): NotificationItem {
  const actor = record.actor?.status === "ACTIVE" ? record.actor : null;
  const actorName = actor?.username ?? "Пользователь";
  const storyAvailable = record.story?.visibility === "PUBLIC" && ["ongoing", "completed"].includes(record.story.status);
  const story = storyAvailable ? record.story : null;

  const content = notificationContent(record.type, actorName, actor?.id ?? null, story?.id ?? null, story?.title ?? null);

  return {
    id: record.id,
    type: record.type,
    message: content.message,
    href: content.href,
    read_at: record.readAt?.toISOString() ?? null,
    created_at: record.createdAt.toISOString(),
    actor: actor ? { id: actor.id, username: actor.username, avatar: actor.avatar } : null
  };
}

function notificationContent(type: NotificationType, actorName: string, actorId: string | null, storyId: string | null, storyTitle: string | null) {
  if (type === "NEW_FOLLOWER") {
    return {
      message: `${actorName} начал отслеживать вас`,
      href: actorId ? ROUTES.author(actorId) : null
    };
  }

  if (!storyId || !storyTitle) {
    return { message: "Связанное произведение больше недоступно", href: null };
  }

  if (type === "STORY_LIKED") {
    return { message: `${actorName} оценил произведение «${storyTitle}»`, href: ROUTES.work(storyId) };
  }

  if (type === "STORY_COMMENTED") {
    return { message: `${actorName} прокомментировал произведение «${storyTitle}»`, href: ROUTES.workComments(storyId) };
  }

  if (type === "COMMENT_REPLIED") {
    return { message: `${actorName} ответил на ваш комментарий`, href: ROUTES.workComments(storyId) };
  }

  return { message: `${actorName} опубликовал новое произведение «${storyTitle}»`, href: ROUTES.work(storyId) };
}
