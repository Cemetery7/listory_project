"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { NotificationItem as NotificationItemType, NotificationsResponse } from "@/lib/notifications/types";
import { NotificationItem } from "./notification-item";

export function NotificationBell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItemType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10", { cache: "no-store" });
      if (!response.ok) return;
      const result = (await response.json()) as { data: NotificationsResponse };
      setItems(result.data.notifications);
      setUnreadCount(result.data.unread_count);
      setAuthenticated(true);
    } catch {
      // Header remains usable when notification delivery is temporarily unavailable.
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const markRead = async (item: NotificationItemType) => {
    setOpen(false);
    if (item.read_at) return;
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry));
    setUnreadCount((count) => Math.max(0, count - 1));
    await fetch(`/api/notifications/${item.id}/read`, { method: "PATCH", keepalive: true }).catch(() => undefined);
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);
    await fetch("/api/notifications/read-all", { method: "POST" }).catch(() => undefined);
  };

  return (
    <div className="relative block" ref={containerRef}>
      <button aria-controls="notification-dropdown" aria-expanded={open} aria-haspopup="dialog" aria-label={unreadCount ? `Уведомления: ${unreadCount} непрочитанных` : "Уведомления"} className="relative grid h-11 w-11 place-items-center rounded-md border border-border bg-surface text-text-secondary transition duration-200 hover:border-[color:var(--border-hover)] hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => { setOpen((value) => !value); if (!open) void loadNotifications(); }} type="button">
        <Bell size={18} />
        {unreadCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
      </button>

      {open ? (
        <div aria-label="Уведомления" className="absolute right-0 top-[52px] z-50 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-lg border border-border bg-card shadow-floating" id="notification-dropdown" role="dialog">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="font-semibold">Уведомления</h2>
            {unreadCount ? <button className="text-xs font-medium text-primary hover:text-primary-hover" onClick={() => void markAllRead()} type="button">Прочитать все</button> : null}
          </div>
          <div className="max-h-[430px] overflow-y-auto p-2">
            {items.length ? items.map((item) => <NotificationItem item={item} key={item.id} onOpen={markRead} />) : (
              <div className="px-5 py-10 text-center"><Bell className="mx-auto text-primary" size={24} /><p className="mt-3 font-semibold">Уведомлений пока нет</p><p className="mt-2 text-sm leading-6 text-text-muted">Здесь появятся новые подписчики, комментарии и оценки.</p></div>
            )}
          </div>
          <div className="border-t border-border p-3">
            <Link className="flex h-10 items-center justify-center rounded-md text-sm font-medium text-primary transition hover:bg-elevated" href={authenticated ? ROUTES.NOTIFICATIONS : ROUTES.LOGIN} onClick={() => setOpen(false)}>Все уведомления</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
