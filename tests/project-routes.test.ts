import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: vi.fn(), projectFindFirst: vi.fn(), projectFindUnique: vi.fn(), projectFindMany: vi.fn(), projectCreate: vi.fn(), projectUpdate: vi.fn(), projectDeleteMany: vi.fn(), projectDelete: vi.fn(), portfolioFindMany: vi.fn(), portfolioUpdate: vi.fn(), analysisFindUnique: vi.fn(), analysisUpsert: vi.fn(), analysisUpdate: vi.fn(), requestCount: vi.fn(), requestCreate: vi.fn(), transaction: vi.fn(), githubJson: vi.fn(), resolveGithubIdentity: vi.fn(), manifestsFor: vi.fn(), readmeFor: vi.fn(), generateAnalysis: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/project-api", () => ({ projectUser: mocks.user, jsonError: (message: string, status = 400) => Response.json({ error: message }, { status }), sameOrigin: () => true }));
vi.mock("@/lib/db", () => ({ getDb: () => ({ project: { findFirst: mocks.projectFindFirst, findUnique: mocks.projectFindUnique, findMany: mocks.projectFindMany, create: mocks.projectCreate, update: mocks.projectUpdate, deleteMany: mocks.projectDeleteMany }, portfolio: { findMany: mocks.portfolioFindMany, update: mocks.portfolioUpdate }, projectAnalysis: { findUnique: mocks.analysisFindUnique, upsert: mocks.analysisUpsert, update: mocks.analysisUpdate }, analysisRequest: { count: mocks.requestCount, create: mocks.requestCreate }, $transaction: mocks.transaction }) }));
vi.mock("@/lib/projects", () => ({ githubApi: "https://api.github.com", githubJson: mocks.githubJson, isPublicOwnedRepo: (repo: { private: boolean; owner: { login: string } }, login: string) => !repo.private && repo.owner.login.toLowerCase() === login.toLowerCase(), manifestsFor: mocks.manifestsFor, parseRepo: (repo: unknown) => repo, readmeFor: mocks.readmeFor, resolveGithubIdentity: mocks.resolveGithubIdentity, generateAnalysis: mocks.generateAnalysis }));

import { GET as discoverRepos, POST as discoverImport } from "@/app/api/projects/repositories/route";
import { GET as listProjects } from "@/app/api/projects/route";
import { DELETE } from "@/app/api/projects/[id]/route";
import { POST as refresh } from "@/app/api/projects/[id]/refresh/route";
import { PATCH as approve, POST as analyze } from "@/app/api/projects/[id]/analysis/route";

const project = { id: "p1", ownerId: "u1", githubRepositoryId: "77", name: "demo", fullName: "owner/demo", description: "A demo", url: "https://github.com/owner/demo", primaryLanguage: "TypeScript", languages: { TypeScript: 10 }, stars: 0, forks: 0, readme: "README", manifests: {}, contributionEvidence: [], repositoryCreatedAt: new Date(), repositoryUpdatedAt: new Date() };
const analysis = { title: "Project summary", summary: "A sufficiently detailed project summary supported by repository evidence.", purpose: "Describe the stated purpose of this public repository.", features: [], technologies: ["TypeScript"], skills: [], evidence: [] };
const ctx = { params: Promise.resolve({ id: "p1" }) };
const post = (path: string, body: unknown = {}) => new Request(`http://localhost${path}`, { method: "POST", headers: { origin: "http://localhost", "content-type": "application/json" }, body: JSON.stringify(body) });
const patchRequest = (path: string, body: unknown) => new Request(`http://localhost${path}`, { method: "PATCH", headers: { origin: "http://localhost", "content-type": "application/json" }, body: JSON.stringify(body) });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ id: "u1" });
  mocks.projectFindFirst.mockResolvedValue(project);
  mocks.projectFindUnique.mockResolvedValue(project);
  mocks.projectFindMany.mockResolvedValue([]);
  mocks.projectCreate.mockResolvedValue(project);
  mocks.projectDeleteMany.mockResolvedValue({ count: 1 });
  mocks.projectDelete.mockResolvedValue(project);
  mocks.portfolioFindMany.mockResolvedValue([]);
  mocks.portfolioUpdate.mockResolvedValue({});
  mocks.analysisFindUnique.mockResolvedValue(null);
  mocks.analysisUpsert.mockResolvedValue({ ...analysis, approved: false });
  mocks.analysisUpdate.mockResolvedValue({ ...analysis, approved: true, approvedTitle: "Approved title", approvedSummary: "Approved description that must persist after approval." });
  mocks.requestCount.mockResolvedValue(0);
  mocks.requestCreate.mockResolvedValue({});
  mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback({ analysisRequest: { count: mocks.requestCount, create: mocks.requestCreate }, projectAnalysis: { findUnique: mocks.analysisFindUnique, upsert: mocks.analysisUpsert }, portfolio: { findMany: mocks.portfolioFindMany, update: mocks.portfolioUpdate }, portfolioProject: { deleteMany: vi.fn() }, project: { delete: mocks.projectDelete } }));
  mocks.githubJson.mockResolvedValue([]);
  mocks.resolveGithubIdentity.mockResolvedValue({ id: "123", login: "owner", avatarUrl: "https://avatars.githubusercontent.com/u/123" });
  mocks.manifestsFor.mockResolvedValue({}); mocks.readmeFor.mockResolvedValue("README");
  mocks.generateAnalysis.mockResolvedValue({ analysis, source: "AI" });
});

describe("project API acceptance boundaries", () => {
  it("rejects unauthenticated discovery import, refresh, analysis, approval and deletion", async () => {
    mocks.user.mockResolvedValue(null);
    const responses = await Promise.all([
      discoverImport(post("/api/projects/repositories", { repositoryId: "77" })),
      discoverRepos(new Request("http://localhost/api/projects/repositories")),
      listProjects(),
      refresh(post("/api/projects/p1"), ctx), analyze(post("/api/projects/p1/analysis"), ctx),
      approve(patchRequest("/api/projects/p1/analysis", { title: "Project title", summary: analysis.summary, approved: true }), ctx),
      DELETE(new Request("http://localhost/api/projects/p1", { method: "DELETE", headers: { origin: "http://localhost" } }), ctx),
    ]);
    expect(responses.map(response => response.status)).toEqual([401, 401, 401, 401, 401, 401, 401]);
  });

  it("scopes repository discovery and project listings to the authenticated Phase 1 identity", async () => {
    mocks.githubJson.mockResolvedValue([]);
    await discoverRepos(new Request("http://localhost/api/projects/repositories"));
    await listProjects();
    expect(mocks.resolveGithubIdentity).toHaveBeenCalledWith("u1");
    expect(mocks.projectFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { ownerId: "u1" } }));
  });

  it("rejects cross-user project refresh, analysis, approval and deletion", async () => {
    mocks.projectFindFirst.mockResolvedValue(null);
    mocks.projectDeleteMany.mockResolvedValue({ count: 0 });
    const responses = await Promise.all([
      refresh(post("/api/projects/p1"), ctx), analyze(post("/api/projects/p1/analysis"), ctx),
      approve(patchRequest("/api/projects/p1/analysis", { title: "Project title", summary: analysis.summary, approved: true }), ctx),
      DELETE(new Request("http://localhost/api/projects/p1", { method: "DELETE", headers: { origin: "http://localhost" } }), ctx),
    ]);
    expect(responses.map(response => response.status)).toEqual([404, 404, 404, 404]);
    expect(mocks.projectFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "p1", ownerId: "u1" } }));
    expect(mocks.projectDelete).not.toHaveBeenCalled();
  });

  it("returns the existing row for repeated and concurrent duplicate imports", async () => {
    const repo = { id: 77, name: "demo", full_name: "owner/demo", description: null, html_url: "https://github.com/owner/demo", private: false, fork: false, language: "TypeScript", stargazers_count: 0, forks_count: 0, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z", owner: { login: "owner" } };
    mocks.githubJson.mockImplementation(async (url: string) => url.includes("/repos?type=owner") ? [repo] : url.includes("/commits?") ? [] : {});
    mocks.projectFindUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValue(project);
    mocks.projectCreate.mockRejectedValueOnce(Object.assign(new Error("unique"), { code: "P2002" }));
    const responses = await Promise.all([discoverImport(post("/api/projects/repositories", { repositoryId: "77" })), discoverImport(post("/api/projects/repositories", { repositoryId: "77" }))]);
    expect(responses.map(response => response.status).sort()).toEqual([200, 201]);
    expect(mocks.projectCreate).toHaveBeenCalledTimes(2);
    const bodies = await Promise.all(responses.map(response => response.json()));
    expect(bodies.filter(body => body.duplicate)).toHaveLength(1);
    expect(bodies.filter(body => body.project?.id === "p1")).toHaveLength(2);
  });

  it("rejects private repositories and arbitrary external URL import payloads", async () => {
    const privateRepo = { id: 77, private: true, owner: { login: "owner" } };
    mocks.githubJson.mockResolvedValue([privateRepo]);
    const privateResponse = await discoverImport(post("/api/projects/repositories", { repositoryId: "77" }));
    expect(privateResponse.status).toBe(403);
    const external = await discoverImport(post("/api/projects/repositories", { repositoryId: "77", url: "https://attacker.example/" }));
    expect(external.status).toBe(400);
    expect(mocks.githubJson.mock.calls.every(([url]) => String(url).startsWith("https://api.github.com/"))).toBe(true);
  });

  it("keeps approved descriptions intact unless regeneration is explicitly confirmed", async () => {
    mocks.analysisFindUnique.mockResolvedValue({ approved: true, approvedTitle: "Approved title", approvedSummary: "Approved description" });
    const response = await analyze(post("/api/projects/p1/analysis"), ctx);
    expect(response.status).toBe(409);
    expect(mocks.generateAnalysis).not.toHaveBeenCalled();
    expect(mocks.analysisUpsert).not.toHaveBeenCalled();
    const saved = await approve(patchRequest("/api/projects/p1/analysis", { title: "Approved title", summary: "Approved description that should persist after approval.", approved: true }), ctx);
    expect(saved.status).toBe(200);
    expect(mocks.analysisUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { approved: true, approvedTitle: "Approved title", approvedSummary: expect.any(String) } }));
  });

  it("allows replacement of an approved analysis only when confirmation is explicit", async () => {
    mocks.analysisFindUnique.mockResolvedValue({ approved: true });
    const response = await analyze(post("/api/projects/p1/analysis", { confirmApproved: true }), ctx);
    expect(response.status).toBe(200);
    expect(mocks.generateAnalysis).toHaveBeenCalledTimes(1);
    expect(mocks.analysisUpsert).toHaveBeenCalledWith(expect.objectContaining({ update: expect.objectContaining({ approved: false, approvedTitle: null, approvedSummary: null }) }));
  });

  it("does not overwrite approval granted while Gemini generation is in flight", async () => {
    mocks.analysisFindUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ approved: true });
    const response = await analyze(post("/api/projects/p1/analysis"), ctx);
    expect(response.status).toBe(409);
    expect(mocks.analysisUpsert).not.toHaveBeenCalled();
  });

  it("enforces the per-user hourly request cap before calling the analysis provider", async () => {
    mocks.requestCount.mockResolvedValue(5);
    const response = await analyze(post("/api/projects/p1/analysis"), ctx);
    expect(response.status).toBe(429);
    expect(mocks.requestCreate).not.toHaveBeenCalled();
    expect(mocks.generateAnalysis).not.toHaveBeenCalled();
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
  });

  it("serializes concurrent quota checks so parallel requests cannot exceed the cap", async () => {
    let used = 3;
    let tail = Promise.resolve();
    mocks.requestCount.mockImplementation(async () => used);
    mocks.requestCreate.mockImplementation(async () => { used += 1; return {}; });
    mocks.transaction.mockImplementation((callback: (tx: unknown) => unknown) => {
      const result = tail.then(() => callback({ analysisRequest: { count: mocks.requestCount, create: mocks.requestCreate }, projectAnalysis: { findUnique: mocks.analysisFindUnique, upsert: mocks.analysisUpsert } }));
      tail = result.then(() => undefined, () => undefined);
      return result;
    });
    const responses = await Promise.all(Array.from({ length: 6 }, () => analyze(post("/api/projects/p1/analysis"), ctx)));
    expect(responses.filter(response => response.status === 200)).toHaveLength(2);
    expect(responses.filter(response => response.status === 429)).toHaveLength(4);
    expect(used).toBe(5);
    expect(mocks.generateAnalysis).toHaveBeenCalledTimes(2);
  });

  it("uses the fixed GitHub API origin when refreshing a stored repository", async () => {
    mocks.githubJson.mockImplementation(async (url: string) => url === "https://api.github.com/repos/owner/demo" ? { ...project, id: 77, full_name: "owner/demo", private: false, owner: { login: "owner" } } : []);
    await refresh(post("/api/projects/p1"), ctx);
    expect(mocks.githubJson.mock.calls.every(([url]) => String(url).startsWith("https://api.github.com/"))).toBe(true);
  });
});
