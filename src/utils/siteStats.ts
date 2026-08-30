import type { Company, CompanyTier, VerificationStatus } from "../types";

const ALL_TIERS: CompanyTier[] = ["S", "A", "B", "C"];
const ALL_VERIFICATION_STATUSES: VerificationStatus[] = ["已公开核验", "部分核验", "待核验"];

export function getSiteStats(companies: Company[]) {
  const verificationDates = companies.map((company) => company.lastVerifiedAt).filter((date): date is string => Boolean(date));
  const tierCounts = countBy(companies, (company) => company.tier, ALL_TIERS);
  const verificationCounts = countBy(companies, (company) => company.verificationStatus, ALL_VERIFICATION_STATUSES);

  return {
    companyCount: companies.length,
    tierCounts,
    verificationCounts,
    companiesWithApplicationEntries: companies.filter((company) => (company.applicationEntries?.length ?? 0) > 0).length,
    applicationEntryCount: companies.reduce((total, company) => total + (company.applicationEntries?.length ?? 0), 0),
    roleDirectionCount: new Set(companies.flatMap((company) => company.roleDirections?.map((direction) => direction.roleId) ?? [])).size,
    latestVerifiedAt: verificationDates.sort().at(-1) ?? "待维护",
  };
}

function countBy<T extends string>(companies: Company[], pick: (company: Company) => T, allValues: T[]): Record<T, number> {
  const counts = Object.fromEntries(allValues.map((value) => [value, 0])) as Record<T, number>;
  for (const company of companies) {
    counts[pick(company)] += 1;
  }
  return counts;
}
