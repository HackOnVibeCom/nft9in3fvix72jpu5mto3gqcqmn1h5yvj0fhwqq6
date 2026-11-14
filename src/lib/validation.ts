import { z } from "zod";
export const portfolioInputSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  headline: z.string().trim().max(160),
  biography: z.string().trim().max(2000),
  location: z.string().trim().max(100).nullable().optional(),
  linkedinUrl: z.string().trim().max(2048).nullable().optional(),
  websiteUrl: z.string().trim().max(2048).nullable().optional(),
  slug: z.string().trim().min(2).max(48).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
}).strict();
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try { const url = new URL(value.trim()); return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password ? url.toString() : null; } catch { return null; }
}
export const githubProfileSchema = z.object({ login: z.string().min(1).max(39), avatar_url: z.url().refine(value => new URL(value).hostname === "avatars.githubusercontent.com") });
export function normalizeSlug(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48).replace(/-+$/g, "") || "developer";
}
