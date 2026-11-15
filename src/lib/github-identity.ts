import "server-only";
import { z } from "zod";
import { getDb } from "./db";

const githubIdentitySchema = z.object({
  id: z.number().int().positive(),
  login: z.string().min(1).max(39),
  avatar_url: z.url().refine(value => new URL(value).hostname === "avatars.githubusercontent.com"),
});

const API = "https://api.github.com";

async function githubIdentity(url: string, token?: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("GitHub identity verification failed.");
  return githubIdentitySchema.parse(await response.json());
}

/**
 * Resolve identity from the OAuth account already linked by NextAuth, and verify
 * GitHub's returned numeric ID against that persisted provider account ID.
 */
export async function resolveGithubIdentity(userId: string, expectedProviderAccountId?: string) {
  const db = getDb();
  const account = await db.account.findFirst({
    where: { userId, provider: "github" },
    select: { providerAccountId: true, access_token: true },
  });
  if (!account || (expectedProviderAccountId && account.providerAccountId !== expectedProviderAccountId)) return null;

  let profile: z.infer<typeof githubIdentitySchema> | null = null;
  if (account.access_token) {
    try { profile = await githubIdentity(`${API}/user`, account.access_token); }
    catch { profile = null; }
  }
  if (profile && String(profile.id) !== account.providerAccountId) return null;
  if (!profile) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { githubUsername: true } });
    if (!user?.githubUsername) return null;
    try { profile = await githubIdentity(`${API}/users/${encodeURIComponent(user.githubUsername)}`); }
    catch { return null; }
    if (String(profile.id) !== account.providerAccountId) return null;
  }

  await db.user.update({ where: { id: userId }, data: { githubUsername: profile.login, image: profile.avatar_url } });
  return { id: String(profile.id), login: profile.login, avatarUrl: profile.avatar_url };
}
