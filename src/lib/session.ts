import "server-only";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAuthOptions, isAuthConfigured } from "./auth";
export const requireUser = cache(async () => {
  if (!isAuthConfigured()) redirect("/login");
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) redirect("/login");
  return session.user;
});
