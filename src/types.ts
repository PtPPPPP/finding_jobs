export type CompanyTier = "S" | "A" | "B" | "C";

export type VerificationStatus = "已公开核验" | "部分核验" | "待核验";

export type ApplicationEntryType =
  | "career"
  | "campus"
  | "internship"
  | "experienced"
  | "other";

export interface ApplicationEntry {
  label: string;
  url: string;
  type: ApplicationEntryType;
  verifiedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  englishName?: string;
  tier: CompanyTier;
  category: string[];
  beijingRelevance:
    | "北京总部"
    | "北京研发中心"
    | "北京岗位"
    | "北京创新平台"
    | "待核验";
  focus: string[];
  recommendedSkills: string[];
  roleDirections?: CompanyRoleDirection[];
  relatedRoleSkills?: string[];
  relatedRoleSkillsByLevel?: Record<CompanyRoleFitLevel, string[]>;
  fitScore: number;
  undergraduateFriendlyScore: number;
  reason: string;
  risks?: string;
  projectSuggestion?: string;
  websiteUrl?: string;
  careerUrl?: string;
  applicationEntries?: ApplicationEntry[];
  searchUrl?: string;
  sourceLinks?: string[];
  lastVerifiedAt?: string;
  lastUpdated: string;
  verificationStatus: VerificationStatus;
}

export type JobFunction =
  | "research-development"
  | "product-solution"
  | "technical-service"
  | "delivery-project"
  | "testing-quality"
  | "manufacturing-supply"
  | "sales-market"
  | "operations-support";

export type JobTrack =
  | "rd"
  | "technical-non-rd"
  | "business-operations";

export type RoleKind = "career-direction" | "graduate-entry";

export type CompanyRoleFitLevel = "core" | "adjacent" | "possible";

export interface CompanyRoleFit {
  roleId: string;
  companyId: string;
  level: CompanyRoleFitLevel;
  reason: string;
}

export interface CompanyRoleDirection {
  roleId: string;
  title: string;
  level: CompanyRoleFitLevel;
  reason: string;
}

export interface JobRole {
  id: string;
  title: string;
  functionType: JobFunction;
  track: JobTrack;
  roleKind: RoleKind;
  description: string;
  commonTitles: string[];
  typicalResponsibilities: string[];
  suitableMajors: string[];
  suitableTraits: string[];
  challenges: string[];
  automationStudentFit?: string[];
  requiredSkills: string[];
  niceToHaveSkills: string[];
  resumeProjectIdeas: string[];
  transitionFrom: string[];
  transitionTo: string[];
  workflowStage?: string;
  primaryDeliverables?: string[];
  accountability?: string;
  technicalDepth: number;
  communicationIntensity: number;
  travelIntensity: number;
  coordinationIntensity: number;
  entryLevelFit: number;
}

export type SkillGroup =
  | "software-engineering"
  | "robotics-algorithm"
  | "product-project"
  | "technical-service"
  | "testing-quality"
  | "manufacturing-supply"
  | "sales-market-operations";

export type SkillPriority = "primary" | "secondary" | "specialized";

export interface SkillDefinition {
  name: string;
  group: SkillGroup;
  priority: SkillPriority;
}

export interface QuickPickPreferences {
  workType:
    | "technology"
    | "customer"
    | "product-project"
    | "business"
    | "manufacturing"
    | "unsure";
  travel: "low" | "some" | "high" | "any";
  workStyle: "independent" | "coordination" | "customer" | "field" | "unsure";
  technicalDepth: "deep" | "balanced" | "business" | "unsure";
  entryPriority: "easy" | "medium" | "long-term";
}

export interface JobRoleFilters {
  keyword: string;
  functionType: JobFunction | "all";
  track: JobTrack | "all";
  roleId: string;
}

export interface CompanyFilters {
  keyword: string;
  tier: CompanyTier | "全部";
  category: string;
  role: string;
  skill: string;
}

export type CompanySortKey =
  | "fitScore"
  | "undergraduateFriendlyScore"
  | "tier";
