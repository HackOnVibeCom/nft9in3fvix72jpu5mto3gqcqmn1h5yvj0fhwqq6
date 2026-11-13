import { z } from "zod";
export const portfolioInputSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  headline: z.string().trim().max(160),
  biography: z.string().trim().max(2000),
}).strict();
export const githubProfileSchema = z.object({ login: z.string().min(1).max(39), avatar_url: z.url().refine(value => new URL(value).hostname === "avatars.githubusercontent.com") });
export function normalizeSlug(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48).replace(/-+$/g, "") || "developer";
}
