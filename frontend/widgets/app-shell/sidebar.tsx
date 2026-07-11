"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Clock3,
  Compass,
  Home,
  Library,
  PenLine,
  Settings,
  Sparkles,
  Tags,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Главная", icon: Home, href: ROUTES.HOME, match: ROUTES.HOME },
  { label: "Каталог", icon: Compass, href: ROUTES.CATALOG, match: ROUTES.CATALOG },
  { label: "Подборки", icon: Library, href: "/#collections" },
  { label: "Авторы", icon: UsersRound, href: ROUTES.CATALOG },
  { label: "Фандомы", icon: Tags, href: ROUTES.CATALOG },
  { label: "Библиотека", icon: Bookmark, href: ROUTES.PROFILE },
  { label: "История", icon: Clock3, href: ROUTES.PROFILE }
];

const bottomItems = [
  { label: "Написать", icon: PenLine, href: ROUTES.CREATE },
  { label: "Настройки", icon: Settings, href: ROUTES.PROFILE },
  { label: "Профиль", icon: UserRound, href: ROUTES.PROFILE }
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const openSidebar = () => setMobileOpen(true);

    window.addEventListener("listoria:open-sidebar", openSidebar);
    return () => window.removeEventListener("listoria:open-sidebar", openSidebar);
  }, []);

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[280px] overflow-y-auto border-r border-border bg-surface px-6 py-6 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Закрыть меню" className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} type="button" />
          <aside className="relative h-full w-[280px] overflow-y-auto border-r border-border bg-surface px-6 py-6 shadow-floating">
            <div className="mb-5 flex justify-end">
              <button
                aria-label="Закрыть меню"
                className="grid h-10 w-10 place-items-center rounded-md border border-border bg-elevated text-text-secondary"
                onClick={() => setMobileOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <div className="mb-8 flex items-center gap-3">
        <Image
          alt="Листория"
          className="h-11 w-11 shrink-0 object-contain"
          height={44}
          priority
          src="/brand/logo-icon.png"
          width={44}
        />
        <div>
          <p className="text-lg font-bold leading-tight">Листория</p>
          <p className="text-xs text-text-muted">Истории рядом</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const itemHash = item.href.includes("#") ? `#${item.href.split("#")[1]}` : "";
          const active = itemHash
            ? pathname === ROUTES.HOME && activeHash === itemHash
            : item.match === ROUTES.HOME
              ? pathname === ROUTES.HOME && !activeHash
              : Boolean(item.match && pathname.startsWith(item.match));

          return (
            <Link
              key={item.label}
              className={cn(
                "flex h-12 items-center gap-3 rounded-md px-4 text-sm font-medium text-text-secondary transition duration-200 hover:bg-elevated hover:text-text-primary hover:shadow-card",
                active && "bg-primary text-white shadow-hero hover:bg-primary hover:text-white"
              )}
              href={item.href}
              onClick={onNavigate}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        className="mt-4 block rounded-lg border border-border bg-elevated p-4 transition duration-200 hover:-translate-y-1 hover:border-[color:var(--border-hover)] hover:shadow-card"
        href={ROUTES.CREATE}
        onClick={onNavigate}
      >
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-sm bg-primary/15 text-primary">
          <Sparkles size={20} />
        </div>
        <p className="text-lg font-bold leading-tight">AI-помощник</p>
        <p className="mt-2 text-sm leading-6 text-text-muted">Подберет теги, описание и краткое саммари.</p>
      </Link>

      <div className="mt-2 flex flex-col gap-2">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            className="flex h-12 items-center gap-3 rounded-md px-4 text-sm font-medium text-text-secondary transition duration-200 hover:bg-elevated hover:text-text-primary"
            href={item.href}
            onClick={onNavigate}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
