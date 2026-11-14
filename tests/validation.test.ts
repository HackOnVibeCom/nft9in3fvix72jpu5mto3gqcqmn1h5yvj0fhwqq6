import { describe, expect, it } from "vitest";
import { normalizeSlug, portfolioInputSchema, githubProfileSchema, safeHttpUrl } from "../src/lib/validation";
describe("portfolio input", () => {
  it.each([["  Jane Doe! ", "jane-doe"], ["Dév---Tools", "dev-tools"], ["🔥", "developer"], ["--Alice--", "alice"]])("normalizes %s", (input, expected) => expect(normalizeSlug(input)).toBe(expected));
  it("caps slugs without trailing separators", () => expect(normalizeSlug("a".repeat(47) + " space")).toBe("a".repeat(47)));
  it("trims valid input", () => expect(portfolioInputSchema.parse({ displayName: " Jane ", headline: " Builder ", biography: "" }).displayName).toBe("Jane"));
  it.each([{ displayName: " ", headline: "", biography: "" }, { displayName: "Jane", headline: "x".repeat(161), biography: "" }, { displayName: "Jane", headline: "", biography: "x".repeat(2001) }, { displayName: "Jane", headline: "", biography: "", published: true }])("rejects invalid or injected input", input => expect(portfolioInputSchema.safeParse(input).success).toBe(false));
  it("only accepts GitHub avatar URLs", () => expect(githubProfileSchema.safeParse({ login: "jane", avatar_url: "https://evil.example/avatar" }).success).toBe(false));
  it("permits only HTTP and HTTPS profile destinations", () => { expect(safeHttpUrl("https://example.com/profile")).toBe("https://example.com/profile"); expect(safeHttpUrl("javascript:alert(1)")).toBeNull(); expect(safeHttpUrl("//evil.example")).toBeNull(); });
});
