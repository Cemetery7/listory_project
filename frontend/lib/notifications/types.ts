import type { NotificationType } from "@/generated/prisma/enums";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  message: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
  actor: {
    id: string;
    username: string;
    avatar: string | null;
  } | null;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  unread_count: number;
  next_cursor: string | null;
};
