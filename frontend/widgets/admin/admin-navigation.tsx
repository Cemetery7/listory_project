"use client";

import Link from "next/link";
import { FileText, LayoutDashboard, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/works", label: "Произведения", icon: FileText },
  { href: "/admin/users", label: "Пользователи", icon: UsersRound }
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Административная навигация">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-text-secondary transition hover:border-[color:var(--border-hover)] hover:text-text-primary",
              active && "border-primary bg-primary text-white hover:border-primary hover:text-white"
            )}
            href={item.href}
            key={item.href}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
