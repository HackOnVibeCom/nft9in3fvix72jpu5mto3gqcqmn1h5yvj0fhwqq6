import "server-only";
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required at runtime.");
  const db = globalForPrisma.prisma ?? new PrismaClient();
  globalForPrisma.prisma = db;
  return db;
}
