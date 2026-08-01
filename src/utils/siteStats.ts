import type { Company } from "../types";

export function getSiteStats(companies: Company[]) {
  const verificationDates = companies.map((company) => company.lastVerifiedAt).filter((date): date is string => Boolean(date));
  return {
    companyCount: companies.length,
    companiesWithApplicationEntries: companies.filter((company) => (company.applicationEntries?.length ?? 0) > 0).length,
    latestVerifiedAt: verificationDates.sort().at(-1) ?? "待维护",
  };
}
