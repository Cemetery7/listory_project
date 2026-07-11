import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/shared/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Вход | Листория",
  description: "Вход в аккаунт Листории."
};

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function Page({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params?.next;
  const registerHref = nextPath ? `${ROUTES.REGISTER}?next=${encodeURIComponent(nextPath)}` : ROUTES.REGISTER;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-text-primary">
      <div className="w-full max-w-[440px]">
        <div className="mb-6 flex justify-center">
          <Image alt="Листория" className="h-[120px] w-auto object-contain" height={1024} priority src="/brand/logo-primary.png" width={1536} />
        </div>
        <Card className="p-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Войти в Листорию</h1>
            <p className="mt-2 text-sm leading-6 text-text-muted">Продолжите читать, писать и собирать свою библиотеку.</p>
          </div>
          <LoginForm nextPath={nextPath} />
          <p className="mt-6 text-center text-sm text-text-muted">
            Нет аккаунта?{" "}
            <Link className="font-semibold text-primary hover:text-primary-hover" href={registerHref}>
              Создать аккаунт
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
