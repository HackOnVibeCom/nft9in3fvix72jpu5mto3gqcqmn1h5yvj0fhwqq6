import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { PublicPortfolioView, type PortfolioPublicSnapshot } from "@/components/public-portfolio-view";
import { getDb } from "@/lib/db";
import { getAppOrigin, portfolioUrl } from "@/lib/app-url";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const published = cache(async (slug: string): Promise<{ data: PortfolioPublicSnapshot; referralCode: string } | null> => {
  const item = await getDb().portfolio.findUnique({ where: { publishedSlug: slug }, select: { published: true, publishedSnapshot: true, referralCode: true } });
  return item?.published && item.publishedSnapshot ? { data: item.publishedSnapshot as unknown as PortfolioPublicSnapshot, referralCode: item.referralCode } : null;
});
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const data = await published(slug);
  if (!data) return { title: "Portfolio not found" };
  const url = portfolioUrl(getAppOrigin(), slug);
  return { title: `${data.data.displayName} — Portfolio`, description: data.data.headline, alternates: { canonical: url }, openGraph: { title: `${data.data.displayName} — Portfolio`, description: data.data.headline, type: "profile", url } };
}
export default async function PublicPortfolio({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const data = await published(slug); if (!data) notFound();
  return <PublicPortfolioView data={data.data} referralCode={data.referralCode} />;
}
