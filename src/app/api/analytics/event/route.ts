import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { dailyVisitorKey, newVisitorToken } from "@/lib/referrals";
import { allowAnalyticsRequest, analyticsRequestIdentity } from "@/lib/analytics-rate-limit";
export const runtime = "nodejs";
const BOT = /bot|crawler|spider|slurp|headless|facebookexternalhit|preview/i;
async function readBoundedJson(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) return { value: null, tooLarge: false };
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024) { await reader.cancel(); return { value: null, tooLarge: true }; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return { value: JSON.parse(new TextDecoder().decode(bytes)) as unknown, tooLarge: false };
}
export async function POST(request: NextRequest) {
  const agent = request.headers.get("user-agent") || "";
  if (!agent || BOT.test(agent)) return NextResponse.json({ ok: true });
  const identity = analyticsRequestIdentity(request.headers, request.cookies.get("skillloop_visitor")?.value);
  if (!allowAnalyticsRequest(identity)) return NextResponse.json({ error: "Too many analytics requests" }, { status: 429, headers: { "Retry-After": "600" } });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return NextResponse.json({ error: "Invalid event" }, { status: 415 });
  let body: { slug?: unknown };
  try {
    const parsed = await readBoundedJson(request);
    if (parsed.tooLarge) return NextResponse.json({ error: "Invalid event" }, { status: 413 });
    body = parsed.value as { slug?: unknown };
  } catch { return NextResponse.json({ error: "Invalid event" }, { status: 400 }); }
  if (!body || Object.keys(body).length !== 1 || typeof body.slug !== "string" || !/^[a-z0-9-]{1,80}$/i.test(body.slug)) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  let db: ReturnType<typeof getDb>;
  let portfolio;
  try { db = getDb(); portfolio = await db.portfolio.findFirst({ where: { publishedSlug: body.slug, published: true }, select: { id: true } }); }
  catch { return NextResponse.json({ ok: true }); }
  if (!portfolio) return NextResponse.json({ ok: true });
  const response = NextResponse.json({ ok: true });
  let token = request.cookies.get("skillloop_visitor")?.value;
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) { token = newVisitorToken(); response.cookies.set("skillloop_visitor", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 365 * 24 * 60 * 60 }); }
  const day = new Date().toISOString().slice(0, 10);
  const visitorKey = dailyVisitorKey(token, day);
  // Store one deduplicated daily event per pseudonymous browser and event kind.
  try {
    await db.portfolioAnalyticsEvent.upsert({ where: { portfolioId_type_visitorKey: { portfolioId: portfolio.id, type: "view", visitorKey } }, create: { portfolioId: portfolio.id, type: "view", visitorKey }, update: {} });
  } catch { /* Tracking is best effort and never affects public rendering. */ }
  response.headers.set("Cache-Control", "no-store");
  return response;
}
