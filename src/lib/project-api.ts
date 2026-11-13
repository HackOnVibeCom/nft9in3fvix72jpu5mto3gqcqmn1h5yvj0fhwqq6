import "server-only";
import { getServerSession } from "next-auth";
import { getAuthOptions, isAuthConfigured } from "./auth";
export async function projectUser() {
  if (!isAuthConfigured()) return null;
  const session = await getServerSession(getAuthOptions());
  return session?.user?.id ? session.user : null;
}
export function jsonError(message: string, status = 400) { return Response.json({ error: message }, { status }); }
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}
