import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { dailyVisitorKey, newVisitorToken, referralCookieName, referralCookieOptions, signReferral } from "@/lib/referrals";
import { allowAnalyticsRequest, analyticsRequestIdentity } from "@/lib/analytics-rate-limit";
import { referralCodeShape, referralDiagnostic, referralErrorCategory } from "@/lib/referral-diagnostics";
export const runtime = "nodejs";
const BOT = /bot|crawler|spider|slurp|headless|facebookexternalhit|preview/i;
export async function GET(request: NextRequest) {
  if (BOT.test(request.headers.get("user-agent") || "")) return NextResponse.redirect(new URL("/login", request.url));
  const code = request.nextUrl.searchParams.get("code") || "";
  if (!/^[a-z0-9-]{1,64}$/i.test(code)) {
    referralDiagnostic("click_request", { result: "invalid_code_format", codeShape: referralCodeShape(code) });
    return NextResponse.redirect(new URL("/", request.url));
  }
  referralDiagnostic("click_request", { result: "accepted_format", codeShape: referralCodeShape(code) });
  const identity = analyticsRequestIdentity(request.headers, request.cookies.get("skillloop_visitor")?.value);
  if (!allowAnalyticsRequest(identity)) return NextResponse.redirect(new URL("/login?error=RateLimited", request.url));
  let portfolio;
  try {
    portfolio = await getDb().portfolio.findUnique({ where: { referralCode: code }, select: { id: true, published: true, publishedSlug: true } });
  } catch {
    referralDiagnostic("click_portfolio_lookup", { result: "failed", errorCategory: "DatabaseLookupError" });
    return NextResponse.redirect(new URL("/login", request.url));
  }
  referralDiagnostic("click_portfolio_lookup", { found: Boolean(portfolio), published: Boolean(portfolio?.published), hasPublishedSlug: Boolean(portfolio?.publishedSlug) });
  if (!portfolio?.published || !portfolio.publishedSlug) return NextResponse.redirect(new URL("/", request.url));
  const response = NextResponse.redirect(new URL("/login", request.url));
  try {
    const cookieOptions = referralCookieOptions();
    response.cookies.set(referralCookieName, signReferral(code), cookieOptions);
    referralDiagnostic("click_cookie_response", { result: "set", secure: cookieOptions.secure, httpOnly: cookieOptions.httpOnly, sameSite: cookieOptions.sameSite, path: cookieOptions.path });
  } catch (error) {
    referralDiagnostic("click_cookie_response", { result: "failed", errorCategory: referralErrorCategory(error) });
    throw error;
  }
  let token = request.cookies.get("skillloop_visitor")?.value;
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) { token = newVisitorToken(); response.cookies.set("skillloop_visitor", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 365 * 24 * 60 * 60 }); }
  const visitorKey = dailyVisitorKey(token, new Date().toISOString().slice(0, 10));
  try {
    await getDb().portfolioAnalyticsEvent.upsert({ where: { portfolioId_type_visitorKey: { portfolioId: portfolio.id, type: "cta_click", visitorKey } }, create: { portfolioId: portfolio.id, type: "cta_click", visitorKey }, update: {} });
    referralDiagnostic("click_analytics_write", { result: "recorded" });
  } catch (error) {
    referralDiagnostic("click_analytics_write", { result: "failed", errorCategory: referralErrorCategory(error) });
    /* Do not interrupt the signup path when analytics storage is unavailable. */
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}
