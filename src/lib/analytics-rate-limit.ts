import "server-only";
import { createHmac, randomBytes } from "node:crypto";

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 60;
const buckets = new Map<string, { startedAt: number; count: number }>();
const rateSecret = process.env.NEXTAUTH_SECRET || randomBytes(32);

function keyFor(identity: string) {
  return createHmac("sha256", rateSecret).update(identity).digest("hex");
}

export function allowAnalyticsRequest(identity: string, now = Date.now()) {
  const key = keyFor(identity || "anonymous");
  let bucket = buckets.get(key);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    bucket = { startedAt: now, count: 0 };
    buckets.set(key, bucket);
  }
  if (bucket.count >= LIMIT) return false;
  bucket.count += 1;
  if (buckets.size > 10_000) {
    for (const [storedKey, storedBucket] of buckets) {
      if (now - storedBucket.startedAt >= WINDOW_MS) buckets.delete(storedKey);
    }
  }
  return true;
}

export function analyticsRequestIdentity(headers: Headers, visitorToken?: string) {
  // x-real-ip is set by the hosting proxy; x-forwarded-for is a fallback for other proxies.
  const ip = headers.get("x-real-ip")?.trim() || headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return ip ? `ip:${ip}` : `visitor:${visitorToken || "anonymous"}`;
}
