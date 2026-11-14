export const PRODUCTION_APP_ORIGIN = "https://skillloop-gamma.vercel.app";

/** Uses only trusted deployment configuration; request Host headers are never consulted. */
export function getAppOrigin(configuredUrl: string | undefined = process.env.NEXTAUTH_URL): string {
  if (!configuredUrl) return PRODUCTION_APP_ORIGIN;
  try {
    const parsed = new URL(configuredUrl);
    if ((parsed.protocol === "https:" || parsed.protocol === "http:") && !parsed.username && !parsed.password) {
      return parsed.origin;
    }
  } catch {
    // Fall through to the known application origin when configuration is invalid.
  }
  return PRODUCTION_APP_ORIGIN;
}

export function portfolioUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/$/, "")}/p/${encodeURIComponent(slug)}`;
}
