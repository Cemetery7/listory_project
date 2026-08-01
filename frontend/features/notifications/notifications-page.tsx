"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import type { NotificationItem as NotificationItemType, NotificationsResponse } from "@/lib/notifications/types";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { NotificationItem } from "./notification-item";

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationItemType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (nextCursor?: string, append = false) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ limit: "20" });
    if (unreadOnly) params.set("unread", "true");
    if (nextCursor) params.set("cursor", nextCursor);

    try {
      const response = await fetch(`/api/notifications?${params}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const result = (await response.json()) as { data: NotificationsResponse };
      setItems((current) => append ? [...current, ...result.data.notifications] : result.data.notifications);
      setUnreadCount(result.data.unread_count);
      setCursor(result.data.next_cursor);
    } catch {
      setError("Не удалось загрузить уведомления. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [unreadOnly]);

  const markRead = async (item: NotificationItemType) => {
    if (item.read_at) return;
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry));
    setUnreadCount((count) => Math.max(0, count - 1));
    await fetch(`/api/notifications/${item.id}/read`, { method: "PATCH", keepalive: true }).catch(() => undefined);
  };

  const markAll = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setUnreadCount(0);
    if (unreadOnly) await load();
    else setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-primary">Личный раздел</p><h1 className="mt-2 text-4xl font-bold leading-tight md:text-5xl">Уведомления</h1><p className="mt-2 text-sm text-text-muted">{unreadCount ? `${unreadCount} непрочитанных` : "Все события просмотрены"}</p></div>
        <Button disabled={!unreadCount} onClick={() => void markAll()} type="button" variant="secondary"><CheckCheck size={17} />Отметить все прочитанными</Button>
      </div>

      <div className="flex gap-2" role="group" aria-label="Фильтр уведомлений">
        <Button onClick={() => setUnreadOnly(false)} size="sm" type="button" variant={!unreadOnly ? "primary" : "secondary"}>Все</Button>
        <Button onClick={() => setUnreadOnly(true)} size="sm" type="button" variant={unreadOnly ? "primary" : "secondary"}>Непрочитанные</Button>
      </div>

      <Card className="p-2 sm:p-3">
        {loading && !items.length ? <div className="px-5 py-14 text-center text-sm text-text-muted">Загружаем уведомления...</div> : null}
        {error ? <div className="px-5 py-14 text-center"><p className="text-sm text-primary">{error}</p><Button className="mt-4" onClick={() => void load()} size="sm" type="button" variant="secondary">Повторить</Button></div> : null}
        {!loading && !error && !items.length ? <div className="px-5 py-14 text-center"><Bell className="mx-auto text-primary" size={28} /><h2 className="mt-4 text-xl font-bold">Уведомлений пока нет</h2><p className="mt-2 text-sm leading-6 text-text-muted">Здесь появятся новые подписчики, комментарии и оценки.</p></div> : null}
        {items.map((item) => <NotificationItem item={item} key={item.id} onOpen={markRead} />)}
      </Card>

      {cursor ? <div className="flex justify-center"><Button disabled={loading} onClick={() => void load(cursor, true)} type="button" variant="secondary">{loading ? "Загружаем..." : "Показать ещё"}</Button></div> : null}
    </section>
  );
}
