import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { authCookieName } from "./cookies";
import { verifySessionToken } from "./jwt";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      bio: true,
      role: true,
      status: true,
      blockedAt: true,
      blockedReason: true,
      stories: {
        select: {
          id: true,
          title: true,
          status: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { chapters: true }
          }
        },
        orderBy: {
          updatedAt: "desc"
        }
      }
    }
  });
}
