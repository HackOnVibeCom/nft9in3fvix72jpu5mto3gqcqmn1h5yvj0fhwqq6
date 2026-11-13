import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { accountFindFirst, userUpdate, projectFindMany, projectUser } = vi.hoisted(() => ({
  accountFindFirst: vi.fn(),
  userUpdate: vi.fn(),
  projectFindMany: vi.fn(),
  projectUser: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ getDb: () => ({
  account: { findFirst: accountFindFirst },
  user: { update: userUpdate },
  project: { findMany: projectFindMany },
}) }));
vi.mock("@/lib/project-api", () => ({
  projectUser,
  jsonError: (message: string, status = 400) => Response.json({ error: message }, { status }),
}));

import { GET } from "@/app/api/projects/repositories/route";

beforeEach(() => {
  vi.clearAllMocks();
  projectUser.mockResolvedValue({ id: "phase1-user-id", githubUsername: null });
  accountFindFirst.mockResolvedValue({ providerAccountId: "12345", access_token: "existing-oauth-token" });
  userUpdate.mockResolvedValue({});
  projectFindMany.mockResolvedValue([]);
});

describe("public repository discovery", () => {
  it("discovers repositories for an existing Phase 1 session via its linked GitHub Account", async () => {
    const repository = {
      id: 77,
      name: "public-demo",
      full_name: "jane-dev/public-demo",
      description: "Public project",
      html_url: "https://github.com/jane-dev/public-demo",
      private: false,
      fork: false,
      language: "TypeScript",
      stargazers_count: 3,
      forks_count: 1,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-02-01T00:00:00Z",
      owner: { login: "jane-dev" },
    };
    vi.stubGlobal("fetch", vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);
      if (url === "https://api.github.com/user") return Response.json({ id: 12345, login: "jane-dev", avatar_url: "https://avatars.githubusercontent.com/u/12345" });
      if (url.includes("/users/jane-dev/repos?")) return Response.json([repository]);
      throw new Error(`Unexpected GitHub request: ${url}`);
    }));

    const response = await GET(new Request("http://localhost:3000/api/projects/repositories?page=1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.repositories).toHaveLength(1);
    expect(body.repositories[0]).toMatchObject({ id: "77", fullName: "jane-dev/public-demo", imported: false });
    expect(accountFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "phase1-user-id", provider: "github" } }));
    expect(userUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { githubUsername: "jane-dev", image: "https://avatars.githubusercontent.com/u/12345" } }));
    vi.unstubAllGlobals();
  });
});
