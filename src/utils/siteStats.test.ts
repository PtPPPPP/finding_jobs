import { describe, expect, it } from "vitest";
import { getSiteStats } from "./siteStats";
import type { Company } from "../types";

const baseCompany = {
  tier: "A",
  verificationStatus: "部分核验",
  lastVerifiedAt: "2026-07-01",
  roleDirections: [],
  applicationEntries: [],
} as unknown as Company;

function withOverrides(overrides: Partial<Company>): Company {
  return { ...baseCompany, ...overrides };
}

describe("site stats", () => {
  it("calculates company and application entry counts", () => {
    const stats = getSiteStats([
      withOverrides({ id: "a", applicationEntries: [{ url: "https://example.com" }] as never }),
      withOverrides({ id: "b" }),
    ]);
    expect(stats).toMatchObject({ companyCount: 2, companiesWithApplicationEntries: 1, applicationEntryCount: 1 });
  });

  it("counts companies by tier and verification status", () => {
    const stats = getSiteStats([
      withOverrides({ id: "a", tier: "S", verificationStatus: "已公开核验" }),
      withOverrides({ id: "b", tier: "S", verificationStatus: "部分核验" }),
      withOverrides({ id: "c", tier: "A", verificationStatus: "待核验" }),
    ]);
    expect(stats.tierCounts).toEqual({ S: 2, A: 1, B: 0, C: 0 });
    expect(stats.verificationCounts).toEqual({ 已公开核验: 1, 部分核验: 1, 待核验: 1 });
  });

  it("counts distinct role directions across companies", () => {
    const stats = getSiteStats([
      withOverrides({ id: "a", roleDirections: [{ roleId: "rd-1" }, { roleId: "rd-2" }] } as never),
      withOverrides({ id: "b", roleDirections: [{ roleId: "rd-1" }] } as never),
    ]);
    // 同一方向在多家公司出现只计一次
    expect(stats.roleDirectionCount).toBe(2);
  });

  it("reports the latest verification date", () => {
    const stats = getSiteStats([
      withOverrides({ id: "a", lastVerifiedAt: "2026-07-01" }),
      withOverrides({ id: "b", lastVerifiedAt: "2026-07-10" }),
    ]);
    expect(stats.latestVerifiedAt).toBe("2026-07-10");
  });
});
