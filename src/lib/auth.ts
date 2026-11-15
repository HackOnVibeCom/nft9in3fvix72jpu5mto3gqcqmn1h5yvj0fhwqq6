import "server-only";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getDb } from "./db";
import { ensurePortfolio } from "./portfolio";
import { consumeReferralForSignIn } from "./referrals";
import { referralDiagnostic, referralErrorCategory } from "./referral-diagnostics";
import { resolveGithubIdentity } from "./github-identity";

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
      async signIn({ user, account, isNewUser }) {
        const providerAccountId = account?.provider === "github" ? account.providerAccountId : null;
        let linkedGithubAccount = false;
        try {
          if (providerAccountId) {
            linkedGithubAccount = Boolean(await db.account.findFirst({
              where: { userId: user.id, provider: "github", providerAccountId },
              select: { id: true },
            }));
          }
        } catch (error) {
          referralDiagnostic("linked_github_account_check", { result: "failed", errorCategory: referralErrorCategory(error) });
        }
        referralDiagnostic("nextauth_sign_in_event", {
          isNewUser: isNewUser === true,
          isNewUserPropertyPresent: typeof isNewUser === "boolean",
          userIdPresent: Boolean(user.id),
          githubProvider: account?.provider === "github",
          linkedGithubAccount,
        });

        // Referral conversion depends on the persisted user and matching linked
        // GitHub account, never on the provider-mapped `profile` event object.
        try {
          await consumeReferralForSignIn(user.id, isNewUser === true && linkedGithubAccount);
        } catch (error) {
          referralDiagnostic("nextauth_referral_event", { result: "failed", errorCategory: referralErrorCategory(error) });
          /* Referral tracking failures must not interrupt otherwise valid authentication. */
        }

        // NextAuth's event profile is provider-mapped (id/name/email/image), not
        // the raw GitHub payload (login/avatar_url). Resolve optional sync from
        // the already linked account's server-side OAuth token instead.
        let githubUsername = user.githubUsername;
        if (linkedGithubAccount && providerAccountId) {
          try {
            const identity = await resolveGithubIdentity(user.id, providerAccountId);
            githubUsername = identity?.login ?? githubUsername;
            referralDiagnostic("github_profile_sync", { result: identity ? "synced" : "unavailable" });
          } catch (error) {
            referralDiagnostic("github_profile_sync", { result: "failed", errorCategory: referralErrorCategory(error) });
          }
        }
        try {
          await ensurePortfolio(db, { id: user.id, name: user.name, githubUsername });
        } catch (error) {
          referralDiagnostic("ensure_portfolio", { result: "failed", errorCategory: referralErrorCategory(error) });
        }
      },
    },
  };
}
