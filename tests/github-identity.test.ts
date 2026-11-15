import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { accountFindFirst, userFindUnique, userUpdate } = vi.hoisted(() => ({
  accountFindFirst: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
}));
vi.mock("../src/lib/db", () => ({ getDb: () => ({
  account: { findFirst: accountFindFirst },
  user: { findUnique: userFindUnique, update: userUpdate },
}) }));

import { resolveGithubIdentity } from "../src/lib/github-identity";

beforeEach(() => {
  vi.clearAllMocks();
  accountFindFirst.mockResolvedValue({ providerAccountId: "12345", access_token: "server-only-token" });
  userUpdate.mockResolvedValue({});
});

describe("GitHub identity for existing Phase 1 accounts", () => {
  it("resolves a linked account even when the denormalized username is absent", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      id: 12345,
      login: "jane-dev",
      avatar_url: "https://avatars.githubusercontent.com/u/12345",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(resolveGithubIdentity("phase1-user-id")).resolves.toEqual({
      id: "12345",
      login: "jane-dev",
      avatarUrl: "https://avatars.githubusercontent.com/u/12345",
    });

    expect(accountFindFirst).toHaveBeenCalledWith({
      where: { userId: "phase1-user-id", provider: "github" },
      select: { providerAccountId: true, access_token: true },
    });
    expect(fetchMock).toHaveBeenCalledWith("https://api.github.com/user", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer server-only-token" }),
    }));
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "phase1-user-id" },
      data: { githubUsername: "jane-dev", image: "https://avatars.githubusercontent.com/u/12345" },
    });
    expect(userFindUnique).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("rejects a linked account that differs from the OAuth callback account", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(resolveGithubIdentity("phase1-user-id", "different-provider-account")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(userUpdate).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
