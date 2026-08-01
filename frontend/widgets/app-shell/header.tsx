"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LoaderCircle, Menu, Search, UserRound } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, startSearch] = useTransition();

  useEffect(() => {
    const syncQuery = () => {
      setQuery(pathname === ROUTES.CATALOG ? new URLSearchParams(window.location.search).get("q") ?? "" : "");
    };

    syncQuery();
    window.addEventListener("popstate", syncQuery);
    return () => window.removeEventListener("popstate", syncQuery);
  }, [pathname]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    }

    startSearch(() => {
      router.push(`${ROUTES.CATALOG}${params.size ? `?${params.toString()}` : ""}`);
    });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-[72px] border-b border-border bg-background/80 backdrop-blur-[16px] lg:left-[280px]">
      <div className="mx-auto flex h-full max-w-[1320px] items-center gap-2 px-3 sm:gap-3 sm:px-4 md:px-8">
        <button
          aria-label="Открыть меню"
          className="grid h-11 w-11 place-items-center rounded-md border border-border bg-surface text-text-secondary lg:hidden"
          onClick={() => window.dispatchEvent(new CustomEvent("listoria:open-sidebar"))}
          type="button"
        >
          <Menu size={20} />
        </button>
        <div aria-hidden="true" className="hidden shrink-0 items-center sm:flex">
          <Image
            alt=""
            className="h-8 w-8 object-contain md:h-9 md:w-9"
            height={44}
            priority
            src="/brand/logo-icon.png"
            width={44}
          />
        </div>
        <div className="hidden min-w-[140px] text-sm text-text-muted md:block">Главная / Обзор</div>
        <form className="group flex h-[52px] min-w-0 flex-1 items-center gap-3 rounded-md border border-border bg-surface px-3 transition duration-200 focus-within:border-primary focus-within:shadow-hero sm:px-4" onSubmit={submitSearch}>
          <button
            aria-label="Найти"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-text-muted transition hover:bg-elevated hover:text-primary disabled:cursor-wait"
            disabled={isSearching}
            type="submit"
          >
            {isSearching ? <LoaderCircle className="animate-spin text-primary" size={20} /> : <Search className="group-focus-within:text-primary" size={20} />}
          </button>
          <input
            aria-label="Поиск произведений"
            className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск произведений, авторов, тегов..."
            value={query}
          />
          <span className="hidden rounded-xs border border-border px-2 py-1 text-xs text-text-muted sm:block">Ctrl K</span>
        </form>
        <ThemeToggle />
        <button
          aria-label="Уведомления"
          className="hidden h-11 w-11 place-items-center rounded-md border border-border bg-surface text-text-secondary transition duration-200 hover:border-[color:var(--border-hover)] hover:text-text-primary sm:grid"
          type="button"
        >
          <Bell size={18} />
        </button>
        <Link className="hidden h-11 items-center gap-3 rounded-md border border-border bg-surface px-3 text-sm font-medium transition duration-200 hover:border-[color:var(--border-hover)] md:flex" href={ROUTES.PROFILE}>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs text-white">ДБ</span>
          Демо
        </Link>
        <Link
          aria-label="Профиль"
          className="grid h-11 w-11 place-items-center rounded-md border border-border bg-surface text-text-secondary transition duration-200 hover:border-[color:var(--border-hover)] hover:text-text-primary md:hidden"
          href={ROUTES.PROFILE}
        >
          <UserRound size={18} />
        </Link>
      </div>
    </header>
  );
}
