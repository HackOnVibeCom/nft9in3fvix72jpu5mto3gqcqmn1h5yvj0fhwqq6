/** Development-only referral tracing. Never pass raw cookies, codes, IDs, or errors. */
export function referralDiagnostic(stage: string, details: Record<string, string | number | boolean | null>) {
  if (process.env.NODE_ENV !== "development") return;
  console.info(JSON.stringify({ scope: "skillloop.referral", stage, ...details }));
}

export function referralErrorCategory(error: unknown) {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string" && /^[A-Z]\d{4}$/.test(error.code)) {
    return error.code;
  }
  if (error instanceof Error) {
    if (/request store|request context/i.test(error.message)) return "NextRequestContextUnavailable";
    if (/NEXTAUTH_SECRET/.test(error.message)) return "ReferralSigningSecretUnavailable";
    return error.name || "Error";
  }
  return "UnknownError";
}

export function referralCodeShape(code: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(code)) return "uuid";
  if (/^[a-z0-9-]{1,64}$/.test(code)) return "slug-like";
  return "other";
}
