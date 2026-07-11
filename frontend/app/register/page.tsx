import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/shared/ui/card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Регистрация | Листория",
  description: "Создание аккаунта Листории."
};

type RegisterPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function Page({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const nextPath = params?.next;
  const loginHref = nextPath ? `${ROUTES.LOGIN}?next=${encodeURIComponent(nextPath)}` : ROUTES.LOGIN;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-text-primary">
      <div className="w-full max-w-[460px]">
        <div className="mb-6 flex justify-center">
          <Image alt="Листория" className="h-[120px] w-auto object-contain" height={1024} priority src="/brand/logo-primary.png" width={1536} />
        </div>
        <Card className="p-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Создать аккаунт</h1>
            <p className="mt-2 text-sm leading-6 text-text-muted">Один аккаунт для чтения, публикации и будущей библиотеки.</p>
          </div>
          <RegisterForm nextPath={nextPath} />
          <p className="mt-6 text-center text-sm text-text-muted">
            Уже есть аккаунт?{" "}
            <Link className="font-semibold text-primary hover:text-primary-hover" href={loginHref}>
              Войти
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
