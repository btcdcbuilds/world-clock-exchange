import { describe, expect, it } from "vitest";
import { mergeRates } from "../lib/api";

describe("mergeRates", () => {
  it("keeps Frankfurter values and fills the missing currencies from the second source", () => {
    const merged = mergeRates(
      "EUR",
      { USD: 1.1355, GBP: 0.85718 },
      { base: "EUR", rates: { EUR: 1, USD: 1.2, GBP: 0.9, AED: 4.16613, VND: 29000 } }
    );
    expect(merged.USD).toBe(1.1355);
    expect(merged.GBP).toBe(0.85718);
    expect(merged.AED).toBeCloseTo(4.16613, 6);
    expect(merged.VND).toBe(29000);
    // The base itself is left out, as Frankfurter does
    expect(merged.EUR).toBeUndefined();
  });

  it("converts the second source to the chosen base when it is quoted in another base", () => {
    // Second source quoted per US dollar; chosen base is the euro (1 EUR = 1.25 USD)
    const merged = mergeRates("EUR", {}, { base: "USD", rates: { USD: 1, EUR: 0.8, AED: 3.6725 } });
    expect(merged.AED).toBeCloseTo(3.6725 / 0.8, 6);
    expect(merged.USD).toBeCloseTo(1.25, 6);
  });

  it("returns the Frankfurter rates unchanged when the second source failed", () => {
    expect(mergeRates("USD", { EUR: 0.88 }, null)).toEqual({ EUR: 0.88 });
  });

  it("uses the second source alone when Frankfurter failed", () => {
    expect(mergeRates("USD", null, { base: "USD", rates: { USD: 1, AED: 3.6725 } })).toEqual({
      AED: 3.6725,
    });
  });
});
