"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/shared/ui/button";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push(ROUTES.LOGIN);
        router.refresh();
      }}
    >
      Выйти
    </Button>
  );
}
