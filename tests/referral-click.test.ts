import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ portfolio: { id: "p1", published: true, publishedSlug: "jane" } as null | { id: string; published: boolean; publishedSlug: string | null }, upsert: vi.fn(), allowed: true }));
vi.mock("@/lib/db", () => ({ getDb: () => ({ portfolio: { findUnique: async () => state.portfolio }, portfolioAnalyticsEvent: { upsert: state.upsert } }) }));
vi.mock("@/lib/referrals", () => ({ dailyVisitorKey: () => "hashed-browser-day", newVisitorToken: () => "123e4567-e89b-12d3-a456-426614174000", referralCookieName: "skillloop_referral", referralCookieOptions: () => ({ httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 }), signReferral: (code: string) => `${code}.signed` }));
vi.mock("@/lib/analytics-rate-limit", () => ({ allowAnalyticsRequest: () => state.allowed, analyticsRequestIdentity: () => "test-client" }));
import { GET } from "../src/app/api/referrals/click/route";
beforeEach(() => { state.portfolio = { id: "p1", published: true, publishedSlug: "jane" }; state.upsert.mockReset().mockResolvedValue({}); state.allowed = true; });
const req = (url: string) => new NextRequest(`https://skillloop.test${url}`);
describe("referral click route", () => {
  it("redirects valid codes only to the same-origin login and sets a signed HTTP-only cookie", async () => {
    const response = await GET(req("/api/referrals/click?code=abc123"));
    expect(response.headers.get("location")).toBe("https://skillloop.test/login");
    expect(response.cookies.get("skillloop_referral")?.value).toBe("abc123.signed");
    expect(response.cookies.get("skillloop_referral")?.httpOnly).toBe(true);
    expect(response.cookies.get("skillloop_referral")?.sameSite).toBe("lax");
  });
  it("accepts a UUID referral code without changing its signed value", async () => {
    const code = "550E8400-E29B-41D4-A716-446655440000";
    const response = await GET(req(`/api/referrals/click?code=${code}`));
    expect(response.headers.get("location")).toBe("https://skillloop.test/login");
    expect(response.cookies.get("skillloop_referral")?.value).toBe(`${code}.signed`);
  });
  it("rejects malformed codes and unpublished portfolios", async () => {
    expect((await GET(req("/api/referrals/click?code=https%3A%2F%2Fevil.test"))).headers.get("location")).toBe("https://skillloop.test/");
    state.portfolio = { id: "p1", published: false, publishedSlug: null };
    expect((await GET(req("/api/referrals/click?code=abc123"))).headers.get("location")).toBe("https://skillloop.test/");
  });
  it("does not count crawler or headless preview requests as CTA clicks", async () => {
    const response = await GET(new NextRequest("https://skillloop.test/api/referrals/click?code=abc123", { headers: { "user-agent": "Googlebot" } }));
    expect(response.headers.get("location")).toBe("https://skillloop.test/login");
    expect(state.upsert).not.toHaveBeenCalled();
  });
  it("still completes the signup redirect when analytics writes fail", async () => {
    state.upsert.mockRejectedValue(new Error("analytics unavailable"));
    expect((await GET(req("/api/referrals/click?code=abc123"))).headers.get("location")).toBe("https://skillloop.test/login");
  });
});
