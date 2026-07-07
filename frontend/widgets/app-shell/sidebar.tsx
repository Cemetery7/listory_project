"use client";

import Link from "next/link";
import {
  Bookmark,
  Clock3,
  Compass,
  Feather,
  Home,
  Library,
  PenLine,
  Settings,
  Sparkles,
  Tags,
  UserRound,
  UsersRound
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Главная", icon: Home, active: true },
  { label: "Каталог", icon: Compass },
  { label: "Подборки", icon: Library },
  { label: "Авторы", icon: UsersRound },
  { label: "Фандомы", icon: Tags },
  { label: "Библиотека", icon: Bookmark },
  { label: "История", icon: Clock3 }
];

const bottomItems = [
  { label: "Написать", icon: PenLine },
  { label: "Настройки", icon: Settings },
  { label: "Профиль", icon: UserRound }
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[280px] border-r border-border bg-surface px-6 py-6 lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-primary text-white shadow-hero">
          <Feather size={22} />
        </div>
        <div>
          <p className="text-lg font-bold leading-tight">Листория</p>
          <p className="text-xs text-text-muted">Истории рядом</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex h-12 items-center gap-3 rounded-md px-4 text-sm font-medium text-text-secondary transition duration-200 hover:bg-elevated hover:text-text-primary hover:shadow-card",
              item.active && "bg-primary text-white shadow-hero hover:bg-primary hover:text-white"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <Link
        className="mb-4 block rounded-lg border border-border bg-elevated p-4 transition duration-200 hover:-translate-y-1 hover:border-[color:var(--border-hover)] hover:shadow-card"
        href={ROUTES.WRITE}
      >
        <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-sm bg-primary/15 text-primary">
          <Sparkles size={20} />
        </div>
        <p className="text-lg font-bold leading-tight">AI-помощник</p>
        <p className="mt-3 text-sm leading-6 text-text-muted">Подберет теги, описание и краткое саммари.</p>
      </Link>

      <div className="mt-4 flex flex-col gap-2">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            className="flex h-12 items-center gap-3 rounded-md px-4 text-sm font-medium text-text-secondary transition duration-200 hover:bg-elevated hover:text-text-primary"
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
