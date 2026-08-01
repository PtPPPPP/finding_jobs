import type {
  Company,
  CompanyRoleFit,
  CompanyRoleFitLevel,
  JobRole,
} from "../types";

const levelOrder = { core: 0, adjacent: 1, possible: 2 } as const;

export interface DerivedRoleSkills {
  core: string[];
  adjacent: string[];
  possible: string[];
}

const emptyDerivedRoleSkills = (): DerivedRoleSkills => ({
  core: [],
  adjacent: [],
  possible: [],
});

export function getRoleRelatedSkills(
  companyId: string,
  roles: JobRole[],
  fits: CompanyRoleFit[],
): DerivedRoleSkills {
  const roleById = new Map(roles.map((role) => [role.id, role]));
  const grouped = emptyDerivedRoleSkills();

  fits
    .filter((fit) => fit.companyId === companyId)
    .forEach((fit) => {
      const role = roleById.get(fit.roleId);
      if (!role) return;
      const target = grouped[fit.level as CompanyRoleFitLevel];
      target.push(...role.requiredSkills);
    });

  (Object.keys(grouped) as CompanyRoleFitLevel[]).forEach((level) => {
    grouped[level] = [...new Set(grouped[level])];
  });

  return grouped;
}

export function enrichCompaniesWithRoleDirections(
  companies: Company[],
  roles: JobRole[],
  fits: CompanyRoleFit[],
): Company[] {
  const roleById = new Map(roles.map((role) => [role.id, role]));
  const fitsByCompanyId = new Map<string, CompanyRoleFit[]>();

  fits.forEach((fit) => {
    const companyFits = fitsByCompanyId.get(fit.companyId) ?? [];
    companyFits.push(fit);
    fitsByCompanyId.set(fit.companyId, companyFits);
  });

  return companies.map((company) => {
    const companyFits = (fitsByCompanyId.get(company.id) ?? []).sort(
      (left, right) =>
        levelOrder[left.level] - levelOrder[right.level] ||
        left.roleId.localeCompare(right.roleId),
    );
    const roleDirections = companyFits.flatMap((fit) => {
      const role = roleById.get(fit.roleId);
      return role
        ? [{ roleId: role.id, title: role.title, level: fit.level, reason: fit.reason }]
        : [];
    });
    const relatedRoleSkillsByLevel = getRoleRelatedSkills(company.id, roles, fits);
    const relatedRoleSkills = [
      ...new Set(Object.values(relatedRoleSkillsByLevel).flat()),
    ];

    return {
      ...company,
      roleDirections,
      relatedRoleSkills,
      relatedRoleSkillsByLevel,
    };
  });
}
