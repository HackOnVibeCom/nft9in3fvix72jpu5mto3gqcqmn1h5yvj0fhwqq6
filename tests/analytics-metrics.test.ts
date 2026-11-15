import { describe, expect, it } from "vitest";
import { analyticsConversionRate } from "../src/lib/analytics-metrics";
describe("analytics aggregation", () => {
  it("uses referred registrations divided by CTA clicks", () => { expect(analyticsConversionRate(20, 3)).toBe(15); });
  it("returns zero for empty data and zero clicks", () => { expect(analyticsConversionRate(0, 0)).toBe(0); expect(analyticsConversionRate(0, 2)).toBe(0); });
});
