import "server-only";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getDb } from "./db";
import { ensurePortfolio } from "./portfolio";
import { githubProfileSchema } from "./validation";

export function isAuthConfigured() {
  return ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"].every(key => Boolean(process.env[key]));
}
export function getAuthOptions(): NextAuthOptions {
  if (!isAuthConfigured()) throw new Error("Authentication is not configured.");
  const db = getDb();
  return {
    adapter: PrismaAdapter(db),
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
    pages: { signIn: "/login", error: "/login" },
    providers: [GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user user:email" } },
    })],
    callbacks: {
      async session({ session, user }) {
        session.user = { ...session.user, id: user.id, githubUsername: user.githubUsername };
        return session;
      },
    },
    events: {
      async signIn({ user, profile }) {
        const github = githubProfileSchema.parse(profile);
        const updated = await db.user.update({ where: { id: user.id }, data: { githubUsername: github.login, image: github.avatar_url } });
        await ensurePortfolio(db, updated);
      },
    },
  };
}
