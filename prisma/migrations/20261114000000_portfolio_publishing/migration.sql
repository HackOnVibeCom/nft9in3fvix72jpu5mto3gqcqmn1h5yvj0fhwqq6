ALTER TABLE "Portfolio"
  ADD COLUMN "location" TEXT,
  ADD COLUMN "linkedinUrl" TEXT,
  ADD COLUMN "websiteUrl" TEXT,
  ADD COLUMN "publishedSnapshot" JSONB,
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "publishedSlug" TEXT;

CREATE UNIQUE INDEX "Portfolio_publishedSlug_key" ON "Portfolio"("publishedSlug");

CREATE TABLE "PortfolioProject" (
  "portfolioId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  CONSTRAINT "PortfolioProject_pkey" PRIMARY KEY ("portfolioId", "projectId"),
  CONSTRAINT "PortfolioProject_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PortfolioProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PortfolioProject_portfolioId_position_key" ON "PortfolioProject"("portfolioId", "position");
CREATE INDEX "PortfolioProject_projectId_idx" ON "PortfolioProject"("projectId");
