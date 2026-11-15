import "server-only";
import { getDb } from "./db";
import { referralDiagnostic } from "./referral-diagnostics";

export async function loadPortfolioAnalytics(userId: string) {
  const db = getDb();
  const portfolio = await db.portfolio.findUnique({ where: { userId }, select: { id: true, published: true, publishedSlug: true } });
  if (!portfolio) {
    referralDiagnostic("analytics_conversion_aggregate", { result: "owner_portfolio_missing", conversionCount: 0 });
    return { portfolio: null, views: 0, clicks: 0, conversions: 0, publishedCount: 0 };
  }
  const [views, clicks, conversions, publishedCount] = await Promise.all([
    db.portfolioAnalyticsEvent.count({ where: { portfolioId: portfolio.id, type: "view" } }),
    db.portfolioAnalyticsEvent.count({ where: { portfolioId: portfolio.id, type: "cta_click" } }),
    db.referralConversion.count({ where: { portfolioId: portfolio.id } }),
    db.portfolio.count({ where: { userId, published: true, publishedSlug: { not: null } } }),
  ]);
  referralDiagnostic("analytics_conversion_aggregate", { result: "counted", conversionCount: conversions });
  return { portfolio, views, clicks, conversions, publishedCount };
}
