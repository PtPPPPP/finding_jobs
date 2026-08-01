import { describe, expect, it } from "vitest";
import { getSiteStats } from "./siteStats";

describe("site stats", () => {
  it("calculates company and application entry counts", () => {
    const stats = getSiteStats([{ id: "a", applicationEntries: [{ url: "https://example.com" }], lastVerifiedAt: "2026-07-01" }, { id: "b", applicationEntries: [], lastVerifiedAt: "2026-07-10" }] as never);
    expect(stats).toMatchObject({ companyCount: 2, companiesWithApplicationEntries: 1, latestVerifiedAt: "2026-07-10" });
  });
});
