import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { normalizeSlug, portfolioInputSchema } from "./validation";

type PortfolioStore = Pick<PrismaClient, "portfolio">;
export async function ensurePortfolio(db: PortfolioStore, user: { id: string; name?: string | null; githubUsername?: string | null }) {
  const existing = await db.portfolio.findUnique({ where: { userId: user.id } });
  if (existing) return existing;
  const defaults = portfolioInputSchema.parse({ displayName: user.name?.trim().slice(0, 80) || user.githubUsername || "Developer", headline: "", biography: "" });
  const base = normalizeSlug(user.githubUsername || user.name || "developer");
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomUUID().slice(0, 8)}`;
    try {
      return await db.portfolio.create({ data: { ...defaults, userId: user.id, slug, published: false } });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      // Another login may have created this user's portfolio concurrently.
      const winner = await db.portfolio.findUnique({ where: { userId: user.id } });
      if (winner) return winner;
    }
  }
  throw new Error("Could not allocate a unique portfolio slug. Please try again.");
}
