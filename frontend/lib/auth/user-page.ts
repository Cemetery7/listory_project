import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

export async function requireUserPage(nextPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}
