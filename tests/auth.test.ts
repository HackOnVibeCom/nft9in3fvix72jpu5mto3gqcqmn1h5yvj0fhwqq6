import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { accountFindFirst, ensure, db } = vi.hoisted(() => {
  const accountFindFirst = vi.fn();
  return { accountFindFirst, ensure: vi.fn(), db: { account: { findFirst: accountFindFirst } } };
});
vi.mock("../src/lib/db", () => ({ getDb: () => db }));
vi.mock("../src/lib/portfolio", () => ({ ensurePortfolio: ensure }));
const referral = vi.hoisted(() => vi.fn());
vi.mock("../src/lib/referrals", () => ({ consumeReferralForSignIn: referral }));
const resolveIdentity = vi.hoisted(() => vi.fn());
vi.mock("../src/lib/github-identity", () => ({ resolveGithubIdentity: resolveIdentity }));
import { getAuthOptions, isAuthConfigured } from "../src/lib/auth";
beforeEach(() => {
  vi.clearAllMocks();
  accountFindFirst.mockResolvedValue({ id: "linked-account" });
  resolveIdentity.mockResolvedValue({ id: "12345", login: "jane", avatarUrl: "https://avatars.githubusercontent.com/u/123" });
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
  vi.stubEnv("NEXTAUTH_URL", "http://localhost:3000");
  vi.stubEnv("NEXTAUTH_SECRET", "test-only-secret");
  vi.stubEnv("GITHUB_CLIENT_ID", "test-client");
  vi.stubEnv("GITHUB_CLIENT_SECRET", "test-only-client-secret");
});
describe("auth configuration", () => {
  it("uses database sessions and identity-only GitHub permissions", () => {
    const options = getAuthOptions();
    expect(options.adapter).toBeDefined();
    expect(options.session?.strategy).toBe("database");
    const provider = options.providers[0] as { options?: { authorization?: { params?: { scope?: string } } } };
    expect(provider.options?.authorization?.params?.scope).toBe("read:user user:email");
  });
  it("fails closed without credentials", () => {
    vi.stubEnv("GITHUB_CLIENT_SECRET", "");
    expect(isAuthConfigured()).toBe(false);
    expect(() => getAuthOptions()).toThrow("not configured");
  });
  it("records a new-user referral from the actual mapped event profile without raw GitHub fields", async () => {
    const options = getAuthOptions();
    const user = { id: "brand-new", name: "Jane", email: "jane@example.test", image: "https://avatars.githubusercontent.com/u/123" };
    const account = { provider: "github", providerAccountId: "12345", type: "oauth" };
    const profile = { id: "12345", name: "Jane", email: "jane@example.test", image: "https://avatars.githubusercontent.com/u/123" };
    await options.events!.signIn!({ user, account, profile, isNewUser: true } as never);
    expect(accountFindFirst).toHaveBeenCalledWith({ where: { userId: "brand-new", provider: "github", providerAccountId: "12345" }, select: { id: true } });
    expect(resolveIdentity).toHaveBeenCalledWith("brand-new", "12345");
    expect(ensure).toHaveBeenCalledWith(db, { id: "brand-new", name: "Jane", githubUsername: "jane" });
    expect(referral).toHaveBeenCalledWith("brand-new", true);
  });
  it("never records repeat sign-ins as new referrals", async () => {
    const options = getAuthOptions();
    await options.events!.signIn!({ user: { id: "existing", name: "Jane" }, account: { provider: "github", providerAccountId: "12345" }, profile: { id: "12345", name: "Jane", image: "https://avatars.githubusercontent.com/u/123" }, isNewUser: false } as never);
    expect(referral).toHaveBeenCalledWith("existing", false);
  });
  it("records the referral even when optional GitHub profile synchronization fails", async () => {
    resolveIdentity.mockRejectedValue(new Error("GitHub temporarily unavailable"));
    await expect(getAuthOptions().events!.signIn!({ user: { id: "brand-new", name: "Jane" }, account: { provider: "github", providerAccountId: "12345" }, profile: { id: "12345", name: "Jane", image: null }, isNewUser: true } as never)).resolves.toBeUndefined();
    expect(referral).toHaveBeenCalledWith("brand-new", true);
    expect(ensure).toHaveBeenCalled();
  });
  it("does not attribute a sign-in without the matching persisted GitHub account", async () => {
    accountFindFirst.mockResolvedValue(null);
    await getAuthOptions().events!.signIn!({ user: { id: "brand-new", name: "Jane" }, account: { provider: "github", providerAccountId: "12345" }, profile: { id: "12345", name: "Jane", image: null }, isNewUser: true } as never);
    expect(referral).toHaveBeenCalledWith("brand-new", false);
    expect(resolveIdentity).not.toHaveBeenCalled();
  });
  it("keeps authentication successful when referral persistence fails", async () => {
    const options = getAuthOptions();
    referral.mockRejectedValue(new Error("database unavailable"));
    await expect(options.events!.signIn!({ user: { id: "brand-new", name: "Jane" }, account: { provider: "github", providerAccountId: "12345" }, profile: { id: "12345", name: "Jane", image: null }, isNewUser: true } as never)).resolves.toBeUndefined();
  });
});
