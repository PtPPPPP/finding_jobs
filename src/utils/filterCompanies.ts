import type { Company, CompanyFilters } from "../types";
import { expandSearchTerms } from "./searchAliases";

const includesText = (value: string | undefined, terms: string[]) => {
  const normalizedValue = value?.toLowerCase();
  return Boolean(normalizedValue && terms.some((term) => normalizedValue.includes(term)));
};

const getCompanySearchText = (company: Company) =>
  [
    company.name,
    company.englishName,
    ...company.cities.map(({ city, presence }) => `${city}${presence === "待核验" ? "" : presence}`),
    company.verificationStatus,
    ...company.category,
    ...company.focus,
    ...(company.roleDirections ?? []).flatMap(({ title, reason }) => [title, reason]),
    ...company.recommendedSkills,
    ...(company.relatedRoleSkills ?? []),
    company.reason,
    company.risks,
    company.projectSuggestion,
    ...(company.sourceLinks ?? []),
    company.lastVerifiedAt,
    company.lastUpdated,
  ]
    .filter(Boolean)
    .join(" ");

export function filterCompanies(companies: Company[], filters: Partial<CompanyFilters>) {
  const searchTerms = expandSearchTerms(filters.keyword ?? "");

  return companies.filter((company) => {
    const matchesKeyword =
      searchTerms.length === 0 || includesText(getCompanySearchText(company), searchTerms);

    const matchesTier =
      !filters.tier || filters.tier === "全部" || company.tier === filters.tier;
    const matchesCity =
      !filters.city || filters.city === "全部" ||
      company.cities.some(({ city }) => city === filters.city);
    const matchesCategory =
      !filters.category || company.category.includes(filters.category);
    const matchesRole =
      !filters.role ||
      (company.roleDirections ?? []).some(
        ({ roleId, title }) => roleId === filters.role || title === filters.role,
      );
    const matchesSkill =
      !filters.skill || company.recommendedSkills.includes(filters.skill);

    return (
      matchesKeyword &&
      matchesTier &&
      matchesCity &&
      matchesCategory &&
      matchesRole &&
      matchesSkill
    );
  });
}
