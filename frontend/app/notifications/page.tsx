import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { NotificationsPage } from "@/features/notifications/notifications-page";
import { requireUserPage } from "@/lib/auth/user-page";
import { AppShell } from "@/widgets/app-shell/app-shell";

export const metadata: Metadata = { title: "Уведомления | Листория" };

export default async function Page() {
  await requireUserPage(ROUTES.NOTIFICATIONS);
  return <AppShell><NotificationsPage /></AppShell>;
}
