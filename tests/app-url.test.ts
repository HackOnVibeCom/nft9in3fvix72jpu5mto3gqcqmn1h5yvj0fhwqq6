import { describe, expect, it } from "vitest";
import { getAppOrigin, portfolioUrl, PRODUCTION_APP_ORIGIN } from "@/lib/app-url";

describe("trusted application URL generation", () => {
  it("uses the configured local application origin", () => {
    expect(getAppOrigin("http://localhost:3000")).toBe("http://localhost:3000");
    expect(portfolioUrl(getAppOrigin("http://localhost:3000"), "jane")).toBe("http://localhost:3000/p/jane");
  });

  it("uses the configured production origin and drops any configured path", () => {
    expect(getAppOrigin("https://skillloop-gamma.vercel.app/dashboard")).toBe(PRODUCTION_APP_ORIGIN);
    expect(portfolioUrl(getAppOrigin("https://skillloop-gamma.vercel.app"), "jane-dev")).toBe("https://skillloop-gamma.vercel.app/p/jane-dev");
  });

  it("falls back safely for invalid or credential-bearing configuration", () => {
    expect(getAppOrigin("not a URL")).toBe(PRODUCTION_APP_ORIGIN);
    expect(getAppOrigin("https://user:secret@example.test")).toBe(PRODUCTION_APP_ORIGIN);
  });

  it("encodes a slug as a single route segment", () => {
    expect(portfolioUrl(PRODUCTION_APP_ORIGIN, "jane developer")).toBe("https://skillloop-gamma.vercel.app/p/jane%20developer");
  });
});
