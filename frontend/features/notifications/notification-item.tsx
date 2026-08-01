"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, BookOpen, Heart, MessageCircle, UserPlus } from "lucide-react";
import type { NotificationItem as NotificationItemType } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

export function NotificationItem({ item, onOpen }: { item: NotificationItemType; onOpen: (item: NotificationItemType) => void }) {
  const Icon = notificationIcon(item.type);
  const content = (
    <>
      <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-primary/15 text-primary">
        {item.actor?.avatar ? <Image alt="" className="h-full w-full object-cover" height={40} src={item.actor.avatar} width={40} /> : <Icon size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 text-text-primary">{item.message}</p>
        <p className="mt-1 text-xs text-text-muted">{formatRelativeTime(item.created_at)}</p>
      </div>
      {!item.read_at ? <span aria-label="Непрочитанное" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
    </>
  );
  const className = cn("flex w-full items-start gap-3 rounded-md p-3 text-left transition hover:bg-elevated", !item.read_at && "bg-primary/5");

  return item.href ? <Link className={className} href={item.href} onClick={() => onOpen(item)}>{content}</Link> : <div className={className}>{content}</div>;
}

function notificationIcon(type: NotificationItemType["type"]) {
  if (type === "NEW_FOLLOWER") return UserPlus;
  if (type === "STORY_LIKED") return Heart;
  if (type === "STORY_COMMENTED" || type === "COMMENT_REPLIED") return MessageCircle;
  if (type === "AUTHOR_PUBLISHED") return BookOpen;
  return Bell;
}

function formatRelativeTime(value: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  const formatter = new Intl.RelativeTimeFormat("ru-RU", { numeric: "auto" });
  if (seconds < 60) return formatter.format(-seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return formatter.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return formatter.format(-hours, "hour");
  return formatter.format(-Math.round(hours / 24), "day");
}
