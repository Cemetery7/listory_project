"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Button } from "./button";

export function BackButton() {
  const router = useRouter();

  const goBack = () => {
    const referrer = document.referrer;
    const sameOriginReferrer = referrer && new URL(referrer).origin === window.location.origin;

    if (sameOriginReferrer && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(ROUTES.HOME);
  };

  return (
    <Button aria-label="Вернуться назад" onClick={goBack} type="button" variant="ghost">
      <ArrowLeft size={18} />
      Назад
    </Button>
  );
}
