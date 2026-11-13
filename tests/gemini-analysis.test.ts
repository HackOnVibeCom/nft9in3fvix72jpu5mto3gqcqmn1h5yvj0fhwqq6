import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock("@google/genai", async importOriginal => {
  const actual = await importOriginal<typeof import("@google/genai")>();
  return { ...actual, GoogleGenAI: class { models = { generateContent }; } };
});

import { analysisSchema, generateAnalysis } from "../src/lib/projects";

const validAnalysis = {
  title: "Evidence-led project",
  summary: "A concise summary supported by the repository evidence provided to the model.",
  purpose: "This project provides a documented example for its stated use case.",
  features: ["Includes a documented feature"],
  technologies: ["TypeScript"],
  skills: ["Repository evidence shows TypeScript code is present."],
  evidence: [{ claim: "TypeScript is present", reference: "GitHub language statistics" }],
};
const evidence = { name: "demo", description: "A public demo", readme: "Public readme", languages: { TypeScript: 42 } };

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  vi.stubEnv("GEMINI_MODEL", "gemini-test-model");
  generateContent.mockResolvedValue({ text: JSON.stringify(validAnalysis) });
});

describe("Gemini structured project analysis", () => {
  it("requests JSON using the configured model and validates it with the Zod schema", async () => {
    const result = await generateAnalysis(evidence);

    expect(result).toEqual({ analysis: validAnalysis, source: "AI" });
    expect(analysisSchema.safeParse(result.analysis).success).toBe(true);
    const request = generateContent.mock.calls[0][0];
    expect(request.model).toBe("gemini-test-model");
    expect(request.config.responseMimeType).toBe("application/json");
    expect(request.config.responseSchema.required).toContain("evidence");
    expect(request.config.httpOptions).toMatchObject({ timeout: 15000, retryOptions: { attempts: 1 } });
    expect(request.config.systemInstruction).toMatch(/infer individual authorship/i);
    expect(request.config.systemInstruction).toMatch(/not independent proof of authorship/i);
    expect(request.contents).not.toContain("GEMINI_API_KEY");
  });

  it("uses deterministic metadata when credentials are missing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const result = await generateAnalysis(evidence);
    expect(result.source).toBe("METADATA");
    expect(result.analysis.features).toEqual([]);
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("redacts likely credentials and personal email addresses from public evidence", async () => {
    const secret = `AIza${"A".repeat(35)}`;
    await generateAnalysis({ ...evidence, readme: `GITHUB_TOKEN=ghp_${"B".repeat(35)}; AWS_SECRET_ACCESS_KEY=${"C".repeat(40)}; api_key=${secret}; DATABASE_URL=postgres://user:pass@example.test/db; maintainer@example.com` });
    const sent = generateContent.mock.calls[0][0].contents as string;
    expect(sent).not.toContain(secret);
    expect(sent).not.toContain(`ghp_${"B".repeat(35)}`);
    expect(sent).not.toContain("postgres://user:pass@example.test/db");
    expect(sent).not.toContain("maintainer@example.com");
    expect(sent).toContain("[redacted credential]");
    expect(sent).toContain("[redacted email]");
  });

  it("redacts credentials stored under sensitive evidence keys", async () => {
    const credential = "should-never-be-sent-123456";
    await generateAnalysis({ ...evidence, manifests: { token: credential, ordinary: "safe" } });
    const sent = generateContent.mock.calls[0][0].contents as string;
    expect(sent).not.toContain(credential);
    expect(sent).toContain("safe");
  });

  it.each([
    ["invalid structured output", { text: JSON.stringify({ title: "bad" }) }],
    ["HTTP 429", Object.assign(new Error("rate limited"), { status: 429 })],
    ["unavailable model", Object.assign(new Error("model unavailable"), { status: 404 })],
  ])("falls back to metadata for %s", async (_case, response) => {
    if (response instanceof Error) generateContent.mockRejectedValue(response);
    else generateContent.mockResolvedValue(response);
    const result = await generateAnalysis(evidence);
    expect(result.source).toBe("METADATA");
    expect(analysisSchema.safeParse(result.analysis).success).toBe(true);
  });
});
