import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

export async function requireAdminPage(nextPath = "/admin") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (user.status !== "ACTIVE" || user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
