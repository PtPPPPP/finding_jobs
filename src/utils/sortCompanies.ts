import type { Company, CompanySortKey, CompanyTier } from "../types";

const tierWeight: Record<CompanyTier, number> = {
  S: 4,
  A: 3,
  B: 2,
  C: 1,
};

export function sortCompanies(companies: Company[], sortKey: CompanySortKey) {
  return [...companies].sort((left, right) => {
    if (sortKey === "tier") {
      return tierWeight[right.tier] - tierWeight[left.tier];
    }

    const scoreDiff = right[sortKey] - left[sortKey];
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return tierWeight[right.tier] - tierWeight[left.tier];
  });
}
