import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../frontend/generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

if (!email) {
  throw new Error("ADMIN_EMAIL is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

try {
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: {
      username: true
    }
  });

  console.log(`Пользователь ${user.username} назначен администратором.`);
} finally {
  await prisma.$disconnect();
}
