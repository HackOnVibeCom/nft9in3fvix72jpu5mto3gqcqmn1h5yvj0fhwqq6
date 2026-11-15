import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ findFirst: vi.fn(), upsert: vi.fn(), rateAllowed: true }));
vi.mock("@/lib/db", () => ({ getDb: () => ({ portfolio: { findFirst: state.findFirst }, portfolioAnalyticsEvent: { upsert: state.upsert } }) }));
vi.mock("@/lib/referrals", () => ({ dailyVisitorKey: (_token: string, day: string) => `visitor-${day}`, newVisitorToken: () => "123e4567-e89b-12d3-a456-426614174000" }));
vi.mock("@/lib/analytics-rate-limit", () => ({ allowAnalyticsRequest: () => state.rateAllowed, analyticsRequestIdentity: () => "test-client" }));
import { POST } from "../src/app/api/analytics/event/route";
beforeEach(() => { state.findFirst.mockReset().mockResolvedValue({ id: "portfolio-1" }); state.upsert.mockReset().mockResolvedValue({}); state.rateAllowed = true; });
const request = (body: unknown, headers: Record<string, string> = {}) => new NextRequest("https://skillloop.test/api/analytics/event", { method: "POST", headers: { "user-agent": "Mozilla/5.0", "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
describe("public portfolio analytics endpoint", () => {
  it("tracks only a matching published portfolio and uses its unique deduplication key", async () => {
    const response = await POST(request({ slug: "jane-doe" }));
    expect(response.status).toBe(200);
    expect(state.findFirst).toHaveBeenCalledWith({ where: { publishedSlug: "jane-doe", published: true }, select: { id: true } });
    expect(state.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { portfolioId_type_visitorKey: { portfolioId: "portfolio-1", type: "view", visitorKey: expect.stringMatching(/^visitor-/) } } }));
  });
  it("does not track private previews or unknown slugs", async () => {
    state.findFirst.mockResolvedValue(null);
    const response = await POST(request({ slug: "private-preview" }));
    expect(response.status).toBe(200);
    expect(state.upsert).not.toHaveBeenCalled();
  });
  it("rejects malformed or extra event fields", async () => {
    expect((await POST(request({ slug: "ok", userId: "victim" }))).status).toBe(400);
    expect((await POST(request({ slug: "not valid" }))).status).toBe(400);
    expect(state.findFirst).not.toHaveBeenCalled();
  });
  it("rejects oversized request bodies before parsing them", async () => {
    const response = await POST(request({ slug: "jane-doe", extra: "x".repeat(2048) }));
    expect(response.status).toBe(413);
    expect(state.findFirst).not.toHaveBeenCalled();
  });
  it("returns safely when analytics storage fails", async () => {
    state.upsert.mockRejectedValue(new Error("database unavailable"));
    const response = await POST(request({ slug: "jane-doe" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });
  it("applies a server-side request limit beyond daily cookie deduplication", async () => {
    state.rateAllowed = false;
    expect((await POST(request({ slug: "jane-doe" }))).status).toBe(429);
    expect(state.findFirst).not.toHaveBeenCalled();
  });
  it("uses the same unique event key for concurrent duplicate submissions", async () => {
    await Promise.all([POST(request({ slug: "jane-doe" })), POST(request({ slug: "jane-doe" }))]);
    expect(state.upsert).toHaveBeenCalledTimes(2);
    expect(state.upsert.mock.calls[0][0].where).toEqual(state.upsert.mock.calls[1][0].where);
  });
});
