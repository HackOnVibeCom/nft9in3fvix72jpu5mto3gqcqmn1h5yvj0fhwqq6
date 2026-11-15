import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { allowAnalyticsRequest, analyticsRequestIdentity } from "../src/lib/analytics-rate-limit";
describe("analytics rate limiting", () => {
  it("limits a server-side source across changing visitor cookies", () => {
    const identity = analyticsRequestIdentity(new Headers({ "x-real-ip": "198.51.100.4" }), "cookie-a");
    expect(identity).toBe("ip:198.51.100.4");
    const now = Date.now() + Math.random() * 100000;
    for (let i = 0; i < 60; i++) expect(allowAnalyticsRequest(identity, now)).toBe(true);
    expect(allowAnalyticsRequest(identity, now)).toBe(false);
  });
  it("uses a visitor pseudonym where no trusted proxy address is available", () => {
    expect(analyticsRequestIdentity(new Headers(), "visitor-token")).toBe("visitor:visitor-token");
  });
});
