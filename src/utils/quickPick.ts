import type { JobFunction, JobRole, QuickPickPreferences } from "../types";

export interface QuickPickMatch {
  role: JobRole;
  score: number;
  reasons: string[];
  challenge: string;
}

export interface QuickPickResult {
  matches: QuickPickMatch[];
  relaxations: string[];
}

const functionByWorkType: Record<
  Exclude<QuickPickPreferences["workType"], "unsure">,
  JobFunction[]
> = {
  technology: ["research-development", "testing-quality"],
  customer: ["technical-service", "product-solution", "delivery-project"],
  "product-project": ["product-solution", "delivery-project"],
  business: ["sales-market", "operations-support"],
  manufacturing: ["manufacturing-supply", "testing-quality"],
};

const travelTarget = { low: 1, some: 3, high: 5 } as const;
const depthTarget = { deep: 5, balanced: 3, business: 2 } as const;
const tracksByWorkType: Record<
  QuickPickPreferences["workType"],
  JobRole["track"][]
> = {
  technology: ["rd", "technical-non-rd"],
  customer: ["technical-non-rd"],
  "product-project": ["technical-non-rd", "business-operations"],
  business: ["business-operations"],
  manufacturing: ["technical-non-rd", "business-operations"],
  unsure: [],
};

export function scoreJobRoleForPreferences(
  role: JobRole,
  preferences: QuickPickPreferences,
) {
  let score = 0;
  const reasons: string[] = [];
  const desiredFunctions =
    preferences.workType === "unsure"
      ? []
      : functionByWorkType[preferences.workType];

  if (desiredFunctions.includes(role.functionType)) {
    score += 8;
    reasons.push("工作内容偏好匹配");
  }
  const preferredTrack = tracksByWorkType[preferences.workType];
  if (preferredTrack.includes(role.track)) {
    score += 3;
    reasons.push("岗位轨道与你的工作取向一致");
  }

  if (preferences.travel !== "any") {
    const distance = Math.abs(role.travelIntensity - travelTarget[preferences.travel]);
    score += Math.max(0, 5 - distance * 2);
    if (distance <= 1) reasons.push("出差强度接近你的选择");
  }

  if (preferences.technicalDepth !== "unsure") {
    const distance = Math.abs(
      role.technicalDepth - depthTarget[preferences.technicalDepth],
    );
    score += Math.max(0, 6 - distance * 2);
    if (distance <= 1) reasons.push("技术深度接近你的预期");
  }

  if (preferences.workStyle !== "unsure") {
    const styleScore = {
      independent: 6 - role.communicationIntensity,
      coordination: role.coordinationIntensity,
      customer: role.communicationIntensity,
      field: role.travelIntensity,
    }[preferences.workStyle];
    score += styleScore;
    if (styleScore >= 4) reasons.push("日常协作方式与你的偏好接近");
  }

  const entryWeight = preferences.entryPriority === "easy" ? 2 : 1;
  score += role.entryLevelFit * entryWeight;
  if (preferences.entryPriority === "easy" && role.entryLevelFit >= 4) {
    reasons.push("对应届生相对友好");
  }
  if (preferences.entryPriority === "long-term") {
    score += role.technicalDepth + role.coordinationIntensity;
  }

  const challenge = role.challenges[0] ?? "需要结合具体岗位描述进一步确认";
  return { score, reasons: reasons.slice(0, 3), challenge };
}

export function getQuickPickResults(
  roles: JobRole[],
  preferences: QuickPickPreferences,
): QuickPickResult {
  const careerRoles = roles.filter((role) => role.roleKind !== "graduate-entry");
  const relaxations: string[] = [];
  const desiredFunctions =
    preferences.workType === "unsure"
      ? []
      : functionByWorkType[preferences.workType];

  let pool = desiredFunctions.length
    ? careerRoles.filter((role) => desiredFunctions.includes(role.functionType))
    : careerRoles;

  if (preferences.travel !== "any") {
    const target = travelTarget[preferences.travel];
    const strictTravelPool = pool.filter(
      (role) => Math.abs(role.travelIntensity - target) <= 1,
    );
    if (strictTravelPool.length >= 3) {
      pool = strictTravelPool;
    } else {
      relaxations.push("符合工作内容且出差强度完全接近的方向不足 3 个，已放宽出差强度。");
    }
  }

  if (pool.length < 3) {
    pool = careerRoles;
    relaxations.push("严格符合工作内容的方向不足 3 个，已扩展到相邻职能。");
  }

  const matches = pool
    .map((role) => {
      const { score, reasons, challenge } = scoreJobRoleForPreferences(role, preferences);
      return {
        role,
        score,
        reasons: reasons.length ? reasons : ["综合画像与当前选择最接近"],
        challenge,
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.role.entryLevelFit - left.role.entryLevelFit ||
        left.role.id.localeCompare(right.role.id),
    )
    .slice(0, 5);

  return { matches, relaxations };
}
