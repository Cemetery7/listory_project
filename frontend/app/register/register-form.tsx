"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Toast } from "@/shared/ui/toast";

export function RegisterForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [pending, setPending] = useState(false);

  const showMessage = (nextMessage: string) => {
    setMessage(nextMessage);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2600);
  };

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setPending(true);
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.get("username") ?? "",
            email: formData.get("email") ?? "",
            password: formData.get("password") ?? "",
            repeatPassword: formData.get("repeatPassword") ?? ""
          })
        });
        setPending(false);

        if (!response.ok) {
          showMessage("Не удалось создать аккаунт. Проверьте поля.");
          return;
        }

        router.push(nextPath ?? ROUTES.HOME);
        router.refresh();
      }}
    >
      <Input autoComplete="username" name="username" placeholder="Имя пользователя" />
      <Input autoComplete="email" name="email" placeholder="Email" type="email" />
      <Input autoComplete="new-password" name="password" placeholder="Пароль" type="password" />
      <Input autoComplete="new-password" name="repeatPassword" placeholder="Повторите пароль" type="password" />
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        Создать аккаунт
      </Button>
      <Toast message={message} visible={toastVisible} />
    </form>
  );
}
