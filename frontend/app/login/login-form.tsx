"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { readApiError } from "@/lib/api/request";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Toast } from "@/shared/ui/toast";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [pending, setPending] = useState(false);

  const showMessage = (nextMessage: string) => {
    setMessage(nextMessage);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2600);
  };

  const submit = async (endpoint: string, body?: Record<string, FormDataEntryValue>) => {
    setPending(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        showMessage(await readApiError(response, "Не удалось выполнить вход. Проверьте данные."));
        return;
      }

      router.push(nextPath ?? ROUTES.HOME);
      router.refresh();
    } catch {
      showMessage("Сервер недоступен. Проверьте соединение и попробуйте снова.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        void submit("/api/auth/login", {
          email: formData.get("email") ?? "",
          password: formData.get("password") ?? ""
        });
      }}
    >
      <Input autoComplete="email" name="email" placeholder="Email" type="email" />
      <Input autoComplete="current-password" name="password" placeholder="Пароль" type="password" />
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Входим..." : "Войти"}
      </Button>
      <Button className="w-full" disabled={pending} onClick={() => void submit("/api/auth/demo")} size="lg" type="button" variant="secondary">
        {pending ? "Подождите..." : "Войти как Demo"}
      </Button>
      <Toast message={message} visible={toastVisible} />
    </form>
  );
}
