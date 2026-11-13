import NextAuth from "next-auth";
import { getAuthOptions, isAuthConfigured } from "@/lib/auth";
export const runtime = "nodejs";
async function handler(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  if (!isAuthConfigured()) {
    const path = new URL(request.url).pathname;
    if (path.endsWith("/session")) return Response.json(null);
    return Response.redirect(new URL("/login?error=Configuration", request.url), 303);
  }
  // NextAuth v4 expects resolved route params; Next.js 16 supplies a promise.
  return NextAuth(getAuthOptions())(request, { params: await context.params });
}
export { handler as GET, handler as POST };
