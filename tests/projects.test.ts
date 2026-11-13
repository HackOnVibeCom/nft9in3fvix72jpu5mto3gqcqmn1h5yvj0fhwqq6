import { describe, expect, it } from "vitest";
import { vi } from "vitest";
vi.mock("server-only", () => ({}));
import { analysisSchema, githubJson, isPublicOwnedRepo, metadataAnalysis, parseRepo, readmeFor } from "../src/lib/projects";

describe("project evidence validation", () => {
  it("filters private repositories through the parsed public flag", () => {
    const repo = { id: 4, name: "demo", full_name: "alice/demo", description: null, html_url: "https://github.com/alice/demo", private: true, fork: false, language: null, stargazers_count: 0, forks_count: 0, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", owner: { login: "alice" } };
    expect(isPublicOwnedRepo(parseRepo(repo), "alice")).toBe(false);
    expect(isPublicOwnedRepo(parseRepo({ ...repo, private: false, owner: { login: "Alice" } }), "alice")).toBe(true);
    expect(() => parseRepo({ ...repo, id: -1 })).toThrow();
  });
  it("returns a bounded deterministic metadata summary without inventing features", async () => {
    const analysis = await metadataAnalysis({ name: "demo", description: "A public demo", readme: null, languages: { TypeScript: 1200 } });
    expect(analysis.summary).toContain("A public demo");
    expect(analysis.features).toEqual([]);
    expect(analysis.skills[0]).toContain("not mastery");
    expect(analysisSchema.safeParse(analysis).success).toBe(true);
  });
  it("rejects malformed structured AI output", () => {
    expect(analysisSchema.safeParse({ title: "x" }).success).toBe(false);
  });
  it("treats a missing README as optional evidence", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("missing", { status: 404 })));
    await expect(readmeFor("alice/demo")).resolves.toBeNull();
    vi.unstubAllGlobals();
  });
  it("returns a clear error for GitHub API failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("limited", { status: 429 })));
    await expect(githubJson("https://api.github.com/test")).rejects.toThrow(/rate limit/i);
    vi.unstubAllGlobals();
  });
});
