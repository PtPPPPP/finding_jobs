import type {
  CompanyFilters,
  CompanySortKey,
  CompanyTier,
  JobFunction,
  JobRoleFilters,
  JobTrack,
  QuickPickPreferences,
} from "../types";

export const defaultCompanyFilters: CompanyFilters = {
  keyword: "",
  tier: "全部",
  category: "",
  role: "",
  skill: "",
};

export const defaultJobRoleFilters: JobRoleFilters = {
  keyword: "",
  functionType: "all",
  track: "all",
  roleId: "",
};

export const defaultQuickPickPreferences: QuickPickPreferences = {
  workType: "unsure",
  travel: "any",
  workStyle: "unsure",
  technicalDepth: "unsure",
  entryPriority: "medium",
};

export interface DecisionQueryState {
  candidateRoleIds: string[];
  quickPickPreferences: QuickPickPreferences;
}

export const defaultDecisionQueryState: DecisionQueryState = {
  candidateRoleIds: [],
  quickPickPreferences: defaultQuickPickPreferences,
};

const workTypes: QuickPickPreferences["workType"][] = [
  "technology", "customer", "product-project", "business", "manufacturing", "unsure",
];
const travelPreferences: QuickPickPreferences["travel"][] = ["low", "some", "high", "any"];
const workStyles: QuickPickPreferences["workStyle"][] = [
  "independent", "coordination", "customer", "field", "unsure",
];
const technicalDepthPreferences: QuickPickPreferences["technicalDepth"][] = [
  "deep", "balanced", "business", "unsure",
];
const entryPriorities: QuickPickPreferences["entryPriority"][] = [
  "easy", "medium", "long-term",
];

const sortKeys: CompanySortKey[] = [
  "fitScore",
  "undergraduateFriendlyScore",
  "tier",
];

const tiers: Array<CompanyTier | "全部"> = ["全部", "S", "A", "B", "C"];

interface FilterQueryOptions {
  categories: readonly string[];
  roles: readonly string[];
  skills: readonly string[];
  jobFunctions: readonly JobFunction[];
  jobTracks: readonly JobTrack[];
  jobRoleIds: readonly string[];
  candidateRoleIds?: readonly string[];
}

export function parseFilterQuery(search: string, options: FilterQueryOptions) {
  const params = new URLSearchParams(search);
  const tier = params.get("tier") ?? defaultCompanyFilters.tier;
  const category = params.get("category") ?? defaultCompanyFilters.category;
  const role = params.get("role") ?? defaultCompanyFilters.role;
  const skill = params.get("skill") ?? defaultCompanyFilters.skill;
  const sort = params.get("sort") ?? "fitScore";
  const jobFunction =
    params.get("jobFunction") ?? defaultJobRoleFilters.functionType;
  const roleTrack = params.get("roleTrack") ?? defaultJobRoleFilters.track;
  const jobRole = params.get("jobRole") ?? defaultJobRoleFilters.roleId;
  const candidateRoleIds = [
    ...new Set((params.get("candidateRoles") ?? "").split(",").filter(Boolean)),
  ]
    .filter((roleId) => (options.candidateRoleIds ?? options.jobRoleIds).includes(roleId))
    .slice(0, 5);
  const quickPickParts = (params.get("quickPick") ?? "").split(",");
  const quickPickPreferences: QuickPickPreferences = {
    workType: workTypes.includes(quickPickParts[0] as QuickPickPreferences["workType"])
      ? (quickPickParts[0] as QuickPickPreferences["workType"])
      : defaultQuickPickPreferences.workType,
    travel: travelPreferences.includes(quickPickParts[1] as QuickPickPreferences["travel"])
      ? (quickPickParts[1] as QuickPickPreferences["travel"])
      : defaultQuickPickPreferences.travel,
    workStyle: workStyles.includes(quickPickParts[2] as QuickPickPreferences["workStyle"])
      ? (quickPickParts[2] as QuickPickPreferences["workStyle"])
      : defaultQuickPickPreferences.workStyle,
    technicalDepth: technicalDepthPreferences.includes(
      quickPickParts[3] as QuickPickPreferences["technicalDepth"],
    )
      ? (quickPickParts[3] as QuickPickPreferences["technicalDepth"])
      : defaultQuickPickPreferences.technicalDepth,
    entryPriority: entryPriorities.includes(
      quickPickParts[4] as QuickPickPreferences["entryPriority"],
    )
      ? (quickPickParts[4] as QuickPickPreferences["entryPriority"])
      : defaultQuickPickPreferences.entryPriority,
  };

  return {
    filters: {
      keyword: params.get("keyword")?.trim() ?? defaultCompanyFilters.keyword,
      tier: tiers.includes(tier as CompanyTier | "全部")
        ? (tier as CompanyTier | "全部")
        : defaultCompanyFilters.tier,
      category: options.categories.includes(category)
        ? category
        : defaultCompanyFilters.category,
      role: options.roles.includes(role) ? role : defaultCompanyFilters.role,
      skill: options.skills.includes(skill) ? skill : defaultCompanyFilters.skill,
    },
    sortKey: sortKeys.includes(sort as CompanySortKey)
      ? (sort as CompanySortKey)
      : "fitScore",
    jobRoleFilters: {
      keyword:
        params.get("jobKeyword")?.trim() ?? defaultJobRoleFilters.keyword,
      functionType: options.jobFunctions.includes(jobFunction as JobFunction)
        ? (jobFunction as JobFunction)
        : defaultJobRoleFilters.functionType,
      track: options.jobTracks.includes(roleTrack as JobTrack)
        ? (roleTrack as JobTrack)
        : defaultJobRoleFilters.track,
      roleId: options.jobRoleIds.includes(jobRole)
        ? jobRole
        : defaultJobRoleFilters.roleId,
    },
    decisionState: { candidateRoleIds, quickPickPreferences },
  };
}

export function serializeFilterQuery(
  filters: CompanyFilters,
  sortKey: CompanySortKey,
  jobRoleFilters: JobRoleFilters = defaultJobRoleFilters,
  decisionState: DecisionQueryState = defaultDecisionQueryState,
) {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set("keyword", filters.keyword.trim());
  }
  if (filters.tier !== defaultCompanyFilters.tier) {
    params.set("tier", filters.tier);
  }
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.role) {
    params.set("role", filters.role);
  }
  if (filters.skill) {
    params.set("skill", filters.skill);
  }
  if (sortKey !== "fitScore") {
    params.set("sort", sortKey);
  }
  if (jobRoleFilters.keyword.trim()) {
    params.set("jobKeyword", jobRoleFilters.keyword.trim());
  }
  if (jobRoleFilters.functionType !== "all") {
    params.set("jobFunction", jobRoleFilters.functionType);
  }
  if (jobRoleFilters.track !== "all") {
    params.set("roleTrack", jobRoleFilters.track);
  }
  if (jobRoleFilters.roleId) {
    params.set("jobRole", jobRoleFilters.roleId);
  }
  if (decisionState.candidateRoleIds.length) {
    params.set("candidateRoles", decisionState.candidateRoleIds.slice(0, 5).join(","));
  }
  const quickPick = decisionState.quickPickPreferences;
  const hasQuickPickState = Object.entries(defaultQuickPickPreferences).some(
    ([key, value]) => quickPick[key as keyof QuickPickPreferences] !== value,
  );
  if (hasQuickPickState) {
    params.set(
      "quickPick",
      [
        quickPick.workType,
        quickPick.travel,
        quickPick.workStyle,
        quickPick.technicalDepth,
        quickPick.entryPriority,
      ].join(","),
    );
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
