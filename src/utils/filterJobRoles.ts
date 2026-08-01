import { jobFunctionLabels } from "../data/jobFunctions";
import type { JobRole, JobRoleFilters } from "../types";

export interface RoleDisambiguationOption {
  label: string;
  roleId: string;
}

export const jobRoleDisambiguations: Record<
  string,
  { message: string; options: RoleDisambiguationOption[] }
> = {
  pm: {
    message: "PM 可能指产品经理，也可能指项目经理，请先选择。",
    options: [
      { label: "产品经理", roleId: "robot-product-manager" },
      { label: "技术项目经理", roleId: "technical-project-manager" },
    ],
  },
  se: {
    message: "SE 在不同公司含义不同，请按工作内容选择。",
    options: [
      { label: "解决方案工程师", roleId: "solution-engineer" },
      { label: "售前技术工程师", roleId: "pre-sales-engineer" },
      { label: "销售工程师", roleId: "sales-engineer" },
    ],
  },
  ae: {
    message: "当前岗位库中，AE 只对应应用工程方向。",
    options: [{ label: "FAE / 应用工程师", roleId: "robot-application" }],
  },
};

const exactAliasRoleIds: Record<string, string[]> = {
  fae: ["robot-application"],
  fse: ["field-service"],
  npi: ["process-npi"],
  qa: ["quality-engineer"],
  sqe: ["quality-engineer"],
  cqe: ["quality-engineer"],
  pmm: ["technical-marketing"],
  csm: ["customer-success"],
  slam: ["slam-navigation"],
  vla: ["vla-multimodal"],
  bd: ["business-development"],
  "产品 pm": ["robot-product-manager"],
  "项目 pm": ["technical-project-manager"],
};

const normalize = (value: string) => value.trim().toLowerCase();

export function getExactAliasRoleIds(keyword: string) {
  return exactAliasRoleIds[normalize(keyword)];
}

export function getRoleDisambiguation(keyword: string) {
  return jobRoleDisambiguations[normalize(keyword)];
}

const getSearchText = (role: JobRole) =>
  [
    role.title,
    jobFunctionLabels[role.functionType],
    role.description,
    ...role.commonTitles,
    ...role.typicalResponsibilities,
    ...role.suitableMajors,
    ...role.suitableTraits,
    ...role.challenges,
    ...(role.automationStudentFit ?? []),
    ...role.requiredSkills,
    ...role.niceToHaveSkills,
    role.workflowStage,
    ...(role.primaryDeliverables ?? []),
    role.accountability,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export function filterJobRoles(
  roles: JobRole[],
  filters: JobRoleFilters,
  activeSkill = "",
) {
  const normalizedKeyword = normalize(filters.keyword);
  const exactRoleIds = getExactAliasRoleIds(normalizedKeyword);
  const disambiguation = getRoleDisambiguation(normalizedKeyword);
  const constrainedRoleIds =
    exactRoleIds ?? disambiguation?.options.map(({ roleId }) => roleId);

  return roles.filter((role) => {
    const matchesKeyword =
      !normalizedKeyword ||
      (constrainedRoleIds
        ? constrainedRoleIds.includes(role.id)
        : getSearchText(role).includes(normalizedKeyword));
    const matchesFunction =
      filters.functionType === "all" ||
      role.functionType === filters.functionType;
    const matchesTrack =
      filters.track === "all" || role.track === filters.track;
    const matchesRole = !filters.roleId || role.id === filters.roleId;
    const matchesSkill =
      !activeSkill ||
      role.requiredSkills.includes(activeSkill) ||
      role.niceToHaveSkills.includes(activeSkill);

    return (
      matchesKeyword &&
      matchesFunction &&
      matchesTrack &&
      matchesRole &&
      matchesSkill
    );
  });
}
