import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ findUnique: vi.fn(), views: vi.fn(), clicks: vi.fn(), conversions: vi.fn(), portfolioCount: vi.fn() }));
vi.mock("../src/lib/db", () => ({ getDb: () => ({ portfolio: { findUnique: state.findUnique, count: state.portfolioCount }, portfolioAnalyticsEvent: { count: (args: { where: { portfolioId: string; type: string } }) => args.where.type === "view" ? state.views(args) : state.clicks(args) }, referralConversion: { count: state.conversions } }) }));
import { loadPortfolioAnalytics } from "../src/lib/portfolio-analytics";
beforeEach(() => { state.findUnique.mockReset(); state.views.mockReset(); state.clicks.mockReset(); state.conversions.mockReset(); state.portfolioCount.mockReset(); });
describe("owner-scoped portfolio analytics", () => {
  it("loads only the authenticated user's portfolio and scopes every aggregate to it", async () => {
    state.findUnique.mockResolvedValue({ id: "portfolio-owner-b", published: true, publishedSlug: "b" });
    state.views.mockResolvedValue(12); state.clicks.mockResolvedValue(4); state.conversions.mockResolvedValue(2); state.portfolioCount.mockResolvedValue(1);
    const result = await loadPortfolioAnalytics("owner-b");
    expect(state.findUnique).toHaveBeenCalledWith({ where: { userId: "owner-b" }, select: { id: true, published: true, publishedSlug: true } });
    expect(result).toMatchObject({ views: 12, clicks: 4, conversions: 2, publishedCount: 1 });
    expect(state.views).toHaveBeenCalledWith({ where: { portfolioId: "portfolio-owner-b", type: "view" } });
    expect(state.clicks).toHaveBeenCalledWith({ where: { portfolioId: "portfolio-owner-b", type: "cta_click" } });
    expect(state.conversions).toHaveBeenCalledWith({ where: { portfolioId: "portfolio-owner-b" } });
    expect(state.portfolioCount).toHaveBeenCalledWith({ where: { userId: "owner-b", published: true, publishedSlug: { not: null } } });
  });
  it("returns the dashboard empty state when the user has no portfolio", async () => {
    state.findUnique.mockResolvedValue(null);
    expect(await loadPortfolioAnalytics("owner-empty")).toEqual({ portfolio: null, views: 0, clicks: 0, conversions: 0, publishedCount: 0 });
    expect(state.views).not.toHaveBeenCalled(); expect(state.clicks).not.toHaveBeenCalled(); expect(state.conversions).not.toHaveBeenCalled();
  });
});
