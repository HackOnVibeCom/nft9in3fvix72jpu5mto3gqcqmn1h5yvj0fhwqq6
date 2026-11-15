import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import { resolve } from "node:path";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ cookie: undefined as string | undefined, linked: false, conversions: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => state.cookie ? { value: state.cookie } : undefined, set: (_name: string, value: string) => { state.cookie = value || undefined; } }) }));
vi.mock("../src/lib/db", () => ({ getDb: () => ({ account: { findFirst: async ({ where }: { where: { userId: string; provider: string; providerAccountId: string } }) => state.linked && where.userId === "new-github-user" && where.provider === "github" && where.providerAccountId === "github-123" ? { id: "linked-account" } : null }, user: { findUnique: async () => ({ githubUsername: "newuser" }), update: async () => ({}) }, portfolio: { findUnique: async () => ({ id: "owner-portfolio", userId: "owner", published: true, publishedSlug: "owner" }) }, referralConversion: { create: state.conversions } }) }));
vi.mock("../src/lib/portfolio", () => ({ ensurePortfolio: vi.fn() }));
vi.mock("@next-auth/prisma-adapter", () => ({ PrismaAdapter: () => ({}) }));
vi.mock("../src/lib/github-identity", () => ({ resolveGithubIdentity: vi.fn().mockResolvedValue({ id: "12345", login: "newuser", avatarUrl: "https://avatars.githubusercontent.com/u/123" }) }));

import { getAuthOptions } from "../src/lib/auth";
import { referralCookieOptions, signReferral } from "../src/lib/referrals";
// Import the installed v4 implementation by its on-disk path because package
// exports intentionally do not expose NextAuth's internal callback handler.
const callbackHandler = createRequire(import.meta.url)(resolve(process.cwd(), "node_modules/next-auth/core/lib/callback-handler.js")).default as (args: never) => Promise<{ user: { id: string }; isNewUser?: boolean }>;

beforeEach(() => {
  state.cookie = undefined;
  state.linked = false;
  state.conversions.mockReset().mockResolvedValue({ id: "conversion-1" });
  vi.stubEnv("NEXTAUTH_SECRET", "lifecycle-test-secret");
  vi.stubEnv("NEXTAUTH_URL", "http://localhost:3000");
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
  vi.stubEnv("GITHUB_CLIENT_ID", "test-client");
  vi.stubEnv("GITHUB_CLIENT_SECRET", "test-secret");
});

describe("installed NextAuth OAuth referral lifecycle", () => {
  it("converts a new OAuth user with the referral cookie over local HTTP in production mode", async () => {
    expect(referralCookieOptions()).toMatchObject({ secure: false, httpOnly: true, sameSite: "lax", path: "/" });
    // This is the browser's signed cookie set by the public CTA before OAuth begins.
    state.cookie = signReferral("owner-referral-code");
    const options = getAuthOptions();
    // This is the provider-mapped profile passed through NextAuth's callback:
    // { id, name, email, image }. Raw GitHub `login` and `avatar_url` are absent.
    const profile = { id: "github-123", name: "New User", email: "new@example.test", image: "https://avatars.githubusercontent.com/u/123" };
    expect(profile).not.toHaveProperty("login");
    expect(profile).not.toHaveProperty("avatar_url");
    const account = { provider: "github", providerAccountId: "github-123", type: "oauth", access_token: "test-token" };
    const result = await callbackHandler({
      profile,
      account,
      options: {
        adapter: {
          getUserByAccount: async () => null,
          getUserByEmail: async () => null,
          createUser: async () => ({ ...profile, id: "new-github-user" }),
          linkAccount: async (linkedAccount: { userId: string; provider: string; providerAccountId: string }) => { state.linked = linkedAccount.userId === "new-github-user" && linkedAccount.provider === "github" && linkedAccount.providerAccountId === "github-123"; return {}; },
          createSession: async () => ({ sessionToken: "session", userId: "new-github-user", expires: new Date(Date.now() + 60_000) }),
        },
        events: {},
        session: { strategy: "database", maxAge: 60, generateSessionToken: async () => "session" },
      } as never,
    } as never);

    // Mirrors NextAuth core/routes/callback.js: it calls signIn after callbackHandler
    // has linked the account and created the session, passing callbackHandler.isNewUser.
    expect(result.isNewUser).toBe(true);
    expect(options.events!.signIn).toBeDefined();
    await options.events!.signIn!({ user: result.user, account, profile, isNewUser: result.isNewUser } as never);
    expect(state.conversions).toHaveBeenCalledWith({ data: { portfolioId: "owner-portfolio", referredUserId: "new-github-user" } });
    expect(state.conversions).toHaveBeenCalledTimes(1);
    expect(state.cookie).toBeUndefined();
    vi.stubEnv("NEXTAUTH_URL", "https://skillloop.example");
    expect(referralCookieOptions()).toMatchObject({ secure: true, httpOnly: true, sameSite: "lax", path: "/" });
  });
});
