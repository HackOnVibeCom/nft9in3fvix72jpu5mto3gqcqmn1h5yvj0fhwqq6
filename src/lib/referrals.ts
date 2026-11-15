import "server-only";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { referralCodeShape, referralDiagnostic, referralErrorCategory } from "./referral-diagnostics";

const COOKIE = "skillloop_referral";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const visitorSecret = process.env.NEXTAUTH_SECRET || randomBytes(32);
function secret() { return process.env.NEXTAUTH_SECRET; }
function signature(value: string) {
  const key = secret();
  if (!key) throw new Error("NEXTAUTH_SECRET is required for referral attribution.");
  return createHmac("sha256", key).update(value).digest("hex");
}
export function signReferral(code: string, expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS) {
  const payload = `${code}.${expiresAt}`;
  return `${payload}.${signature(payload)}`;
}
export function referralValidationStatus(value?: string): "missing" | "malformed" | "expired" | "secret_unavailable" | "invalid_signature" | "valid" {
  if (!value) return "missing";
  const [code, expiry, mac, extra] = value.split(".");
  if (!code || !/^\d{10}$/.test(expiry || "") || !mac || extra) return "malformed";
  if (Number(expiry) <= Math.floor(Date.now() / 1000)) return "expired";
  let expected: string;
  try { expected = signature(`${code}.${expiry}`); } catch { return "secret_unavailable"; }
  if (mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return "invalid_signature";
  return "valid";
}
export function verifyReferral(value?: string) {
  if (referralValidationStatus(value) !== "valid") return null;
  const [code] = value!.split(".");
  return code;
}
export const referralCookieName = COOKIE;
export function referralCookieOptions() {
  // Match NextAuth's secure-cookie decision to the public auth URL. NODE_ENV can
  // be production during local HTTP staging runs, where Secure cookies are not sent.
  let secure = process.env.NODE_ENV === "production";
  try { secure = new URL(process.env.NEXTAUTH_URL || "http://localhost").protocol === "https:"; } catch { /* Keep the safe environment default for malformed URLs. */ }
  return { httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: MAX_AGE_SECONDS };
}
export async function consumeReferralForSignIn(userId: string, isNewUser: boolean) {
  let jar: Awaited<ReturnType<typeof cookies>> | undefined;
  try {
    jar = await cookies();
    const signedCookie = jar.get(COOKIE)?.value;
    const validation = referralValidationStatus(signedCookie);
    const code = validation === "valid" ? verifyReferral(signedCookie) : null;
    referralDiagnostic("sign_in_referral", { isNewUser, userIdPresent: Boolean(userId), cookiePresent: Boolean(signedCookie), validation, codeShape: code ? referralCodeShape(code) : null });
    if (!isNewUser || !code) return;
    const db = getDb();
    const portfolio = await db.portfolio.findUnique({ where: { referralCode: code }, select: { id: true, userId: true, published: true, publishedSlug: true } });
    referralDiagnostic("referral_portfolio_lookup", { found: Boolean(portfolio), published: Boolean(portfolio?.published), hasPublishedSlug: Boolean(portfolio?.publishedSlug), selfReferral: portfolio?.userId === userId });
    if (!portfolio || !portfolio.published || !portfolio.publishedSlug || portfolio.userId === userId) return;
    try {
      await db.referralConversion.create({ data: { portfolioId: portfolio.id, referredUserId: userId } });
      referralDiagnostic("conversion_insert", { result: "created" });
    } catch (error) {
      // The unique referredUserId constraint makes retries and concurrent callbacks idempotent.
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        referralDiagnostic("conversion_insert", { result: "already_exists" });
      } else {
        referralDiagnostic("conversion_insert", { result: "failed", errorCategory: referralErrorCategory(error) });
        throw error;
      }
    }
  } catch (error) {
    referralDiagnostic("referral_processing", { result: "failed", errorCategory: referralErrorCategory(error) });
    throw error;
  } finally {
    if (jar) {
      try {
        jar.set(COOKIE, "", { ...referralCookieOptions(), maxAge: 0, expires: new Date(0) });
        referralDiagnostic("referral_cookie_cleanup", { result: "cleared" });
      } catch (error) {
        referralDiagnostic("referral_cookie_cleanup", { result: "failed", errorCategory: referralErrorCategory(error) });
        throw error;
      }
    }
  }
}
export function newVisitorToken() { return randomUUID(); }
export function dailyVisitorKey(token: string, day: string) { return createHmac("sha256", visitorSecret).update(`${token}:${day}`).digest("hex"); }
