import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { update, ensure, db } = vi.hoisted(() => {
  const update = vi.fn(); return { update, ensure: vi.fn(), db: { user: { update } } };
});
vi.mock("../src/lib/db", () => ({ getDb: () => db }));
vi.mock("../src/lib/portfolio", () => ({ ensurePortfolio: ensure }));
import { getAuthOptions, isAuthConfigured } from "../src/lib/auth";
beforeEach(() => {
  vi.clearAllMocks();
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
  it("persists username and avatar and initializes the draft on sign-in", async () => {
    const user = { id: "u", githubUsername: "jane" };
    update.mockResolvedValue(user);
    const profile = { name: "Jane", login: "jane", avatar_url: "https://avatars.githubusercontent.com/u/123" };
    await getAuthOptions().events!.signIn!({ user: { id: "u" }, account: null, profile });
    expect(update).toHaveBeenCalledWith({ where: { id: "u" }, data: { githubUsername: "jane", image: "https://avatars.githubusercontent.com/u/123" } });
    expect(ensure).toHaveBeenCalledWith(db, user);
  });
});
