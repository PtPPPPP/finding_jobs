import { describe, expect, it } from "vitest";
import { getVerificationFreshness } from "./verificationFreshness";

const now = new Date("2026-07-16T12:00:00Z");
describe("verification freshness", () => {
  it("classifies fresh, review, stale, and missing dates", () => {
    expect(getVerificationFreshness("2026-07-01", now)).toBe("fresh");
    expect(getVerificationFreshness("2026-06-01", now)).toBe("review");
    expect(getVerificationFreshness("2026-03-01", now)).toBe("stale");
    expect(getVerificationFreshness(undefined, now)).toBe("unverified");
    expect(getVerificationFreshness("not-a-date", now)).toBe("unverified");
  });
});
