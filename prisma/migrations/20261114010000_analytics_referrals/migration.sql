ALTER TABLE "Portfolio" ADD COLUMN "referralCode" TEXT NOT NULL DEFAULT gen_random_uuid()::text;
CREATE UNIQUE INDEX "Portfolio_referralCode_key" ON "Portfolio"("referralCode");
CREATE TABLE "PortfolioAnalyticsEvent" (
  "id" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "visitorKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortfolioAnalyticsEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PortfolioAnalyticsEvent_portfolioId_type_visitorKey_key" ON "PortfolioAnalyticsEvent"("portfolioId", "type", "visitorKey");
CREATE INDEX "PortfolioAnalyticsEvent_portfolioId_type_createdAt_idx" ON "PortfolioAnalyticsEvent"("portfolioId", "type", "createdAt");
CREATE TABLE "ReferralConversion" (
  "id" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "referredUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReferralConversion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReferralConversion_referredUserId_key" ON "ReferralConversion"("referredUserId");
CREATE INDEX "ReferralConversion_portfolioId_createdAt_idx" ON "ReferralConversion"("portfolioId", "createdAt");
ALTER TABLE "PortfolioAnalyticsEvent" ADD CONSTRAINT "PortfolioAnalyticsEvent_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralConversion" ADD CONSTRAINT "ReferralConversion_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralConversion" ADD CONSTRAINT "ReferralConversion_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
