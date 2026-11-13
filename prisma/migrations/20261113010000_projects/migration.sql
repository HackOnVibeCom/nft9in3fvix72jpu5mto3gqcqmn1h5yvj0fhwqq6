CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "githubRepositoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "primaryLanguage" TEXT,
    "languages" JSONB NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "readme" TEXT,
    "manifests" JSONB NOT NULL DEFAULT '{}',
    "contributionEvidence" JSONB NOT NULL DEFAULT '[]',
    "repositoryCreatedAt" TIMESTAMP(3),
    "repositoryUpdatedAt" TIMESTAMP(3),
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refreshedAt" TIMESTAMP(3),
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProjectAnalysis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "technologies" JSONB NOT NULL,
    "skills" JSONB NOT NULL,
    "evidence" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedTitle" TEXT,
    "approvedSummary" TEXT,
    CONSTRAINT "ProjectAnalysis_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AnalysisRequest" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalysisRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Project_ownerId_githubRepositoryId_key" ON "Project"("ownerId", "githubRepositoryId");
CREATE INDEX "Project_ownerId_importedAt_idx" ON "Project"("ownerId", "importedAt");
CREATE UNIQUE INDEX "ProjectAnalysis_projectId_key" ON "ProjectAnalysis"("projectId");
CREATE INDEX "AnalysisRequest_ownerId_createdAt_idx" ON "AnalysisRequest"("ownerId", "createdAt");
ALTER TABLE "AnalysisRequest" ADD CONSTRAINT "AnalysisRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectAnalysis" ADD CONSTRAINT "ProjectAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
