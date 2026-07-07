"use client";

import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-[72px] border-b border-border bg-background/80 backdrop-blur-[16px] lg:left-[280px]">
      <div className="mx-auto flex h-full max-w-[1320px] items-center gap-4 px-4 md:px-8">
        <button className="grid h-11 w-11 place-items-center rounded-md border border-border bg-surface text-text-secondary lg:hidden" type="button">
          <Menu size={20} />
        </button>
        <div className="hidden min-w-[140px] text-sm text-text-muted md:block">Главная / Обзор</div>
        <label className="group flex h-[52px] flex-1 items-center gap-3 rounded-md border border-border bg-surface px-4 transition duration-200 focus-within:border-primary focus-within:shadow-hero">
          <Search className="text-text-muted group-focus-within:text-primary" size={20} />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            placeholder="Поиск произведений, авторов, тегов..."
          />
          <span className="hidden rounded-xs border border-border px-2 py-1 text-xs text-text-muted sm:block">Ctrl K</span>
        </label>
        <ThemeToggle />
        <button
          aria-label="Уведомления"
          className="grid h-11 w-11 place-items-center rounded-md border border-border bg-surface text-text-secondary transition duration-200 hover:border-[color:var(--border-hover)] hover:text-text-primary"
          type="button"
        >
          <Bell size={18} />
        </button>
        <button className="hidden h-11 items-center gap-3 rounded-md border border-border bg-surface px-3 text-sm font-medium md:flex" type="button">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs text-white">ДБ</span>
          Демо
        </button>
      </div>
    </header>
  );
}
