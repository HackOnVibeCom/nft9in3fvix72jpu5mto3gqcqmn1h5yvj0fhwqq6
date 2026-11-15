import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql = readFileSync(new URL("../prisma/migrations/20261114010000_analytics_referrals/migration.sql", import.meta.url), "utf8");
describe("additive analytics migration", () => {
  it("backfills unique UUID referral codes and defaults codes for older clients", () => {
    expect(sql).toMatch(/ADD COLUMN "referralCode" TEXT NOT NULL DEFAULT gen_random_uuid\(\)::text/);
    expect(sql).toMatch(/CREATE UNIQUE INDEX "Portfolio_referralCode_key"/);
  });
  it("adds only event and referral tables with unique and cascading foreign keys", () => {
    expect(sql).toMatch(/CREATE TABLE "PortfolioAnalyticsEvent"/);
    expect(sql).toMatch(/CREATE UNIQUE INDEX "PortfolioAnalyticsEvent_portfolioId_type_visitorKey_key"/);
    expect(sql).toMatch(/CREATE TABLE "ReferralConversion"/);
    expect(sql).toMatch(/CREATE UNIQUE INDEX "ReferralConversion_referredUserId_key"/);
    expect(sql).toMatch(/FOREIGN KEY \("portfolioId"\).*REFERENCES "Portfolio"/);
    expect(sql).toMatch(/FOREIGN KEY \("referredUserId"\).*REFERENCES "User"/);
    expect(sql).not.toMatch(/\b(DROP|TRUNCATE|DELETE FROM)\b/i);
  });
});
