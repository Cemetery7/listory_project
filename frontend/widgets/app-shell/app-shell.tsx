import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

type AppShellProps = {
  children: ReactNode;
  rightPanel?: ReactNode;
};

export function AppShell({ children, rightPanel }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar />
      <Header />
      <main className="pt-[72px] lg:pl-[280px]">
        <div
          className={cn(
            "mx-auto max-w-[1320px] gap-6 px-4 py-6 md:px-8 md:py-8",
            rightPanel && "grid xl:grid-cols-[minmax(0,1fr)_340px]"
          )}
        >
          <div className="min-w-0">{children}</div>
          {rightPanel ? <div className="min-w-0 xl:sticky xl:top-[96px] xl:self-start">{rightPanel}</div> : null}
        </div>
      </main>
    </div>
  );
}
