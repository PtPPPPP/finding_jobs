import type { CompanyRoleFit, CompanyRoleFitLevel } from "../types";

interface RoleFitSeed {
  core: string[];
  adjacent?: string[];
  possible?: string[];
}

const seeds: Record<string, RoleFitSeed> = {
  "robot-algorithm-intern": {
    core: ["galbot", "galaxea-ai"],
    adjacent: ["robotera", "tiangong-center"],
    possible: ["baai"],
  },
  "control-algorithm": {
    core: ["robotera", "noetix"],
    adjacent: ["booster", "rokae"],
    possible: ["aubo"],
  },
  "rl-locomotion": {
    core: ["galaxea-ai", "robotera"],
    adjacent: ["tiangong-center"],
    possible: ["xiaomi-robotics"],
  },
  "ros2-dev": {
    core: ["noetix", "booster"],
    adjacent: ["riguan-robotics"],
    possible: ["newtonic-beijing"],
  },
  "simulation-platform": {
    core: ["tiangong-center", "roboscience"],
    adjacent: ["worldstream"],
    possible: ["galaxea-ai"],
  },
  "robot-test": {
    core: ["robotera", "booster", "yunji"],
    adjacent: ["jd-robotics"],
    possible: ["aubo"],
  },
  "robot-application": {
    core: ["mech-mind", "aubo", "orionstar"],
    adjacent: ["yunji", "jd-robotics", "robotera", "booster"],
    possible: ["casbot", "linker-hand", "riguan-robotics", "jiyi-embodied"],
  },
  "vision-algorithm": {
    core: ["mech-mind", "gigaai"],
    adjacent: ["xiaomi-robotics"],
    possible: ["horizon"],
  },
  "slam-navigation": {
    core: ["orionstar", "yunji"],
    adjacent: ["meituan-robotics"],
    possible: ["jd-robotics"],
  },
  "dexterous-hand": {
    core: ["linker-hand", "mech-mind"],
    adjacent: ["rokae", "aubo"],
    possible: ["galbot"],
  },
  "embodied-data-loop": {
    core: ["galaxea-ai", "bytedance-seed"],
    adjacent: ["worldstream"],
    possible: ["jiyi-embodied"],
  },
  "vla-multimodal": {
    core: ["galbot", "bytedance-seed", "baai"],
    adjacent: ["gigaai"],
    possible: ["baidu-cloud-robotics"],
  },
  "pm-solution": {
    core: ["orionstar", "yunji"],
    adjacent: ["jd-robotics", "baidu-cloud-robotics"],
    possible: ["yongxing-beijing"],
  },
  "robot-product-manager": {
    core: ["galbot", "orionstar", "meituan-robotics"],
    adjacent: ["robotera", "baidu-cloud-robotics", "honor-robotics"],
    possible: ["horizon", "xiaomi-robotics"],
  },
  "solution-engineer": {
    core: ["mech-mind", "aubo", "orionstar"],
    adjacent: ["yunji", "jd-robotics", "baidu-cloud-robotics"],
    possible: ["hirain", "yongxing-beijing", "casbot"],
  },
  "pre-sales-engineer": {
    core: ["mech-mind", "rokae", "aubo"],
    adjacent: ["orionstar", "yunji", "horizon"],
    possible: ["hirain", "newtonic-beijing", "yongxing-beijing"],
  },
  "technical-support": {
    core: ["noetix", "booster", "linker-hand"],
    adjacent: ["mech-mind", "aubo", "orionstar", "yunji"],
    possible: ["horizon", "hirain", "newtonic-beijing", "yongxing-beijing"],
  },
  "field-service": {
    core: ["rokae", "aubo", "orionstar"],
    adjacent: ["yunji", "jd-robotics", "mech-mind"],
    possible: ["riguan-robotics", "hirain"],
  },
  "customer-success": {
    core: ["baidu-cloud-robotics", "orionstar"],
    adjacent: ["bytedance-seed", "worldstream", "yunji"],
    possible: ["jd-robotics", "gigaai"],
  },
  "project-implementation": {
    core: ["mech-mind", "aubo", "orionstar"],
    adjacent: ["yunji", "jd-robotics", "baidu-cloud-robotics"],
    possible: ["hirain", "yongxing-beijing", "tiangong-center"],
  },
  "project-delivery": {
    core: ["robotera", "mech-mind", "orionstar"],
    adjacent: ["aubo", "yunji", "jd-robotics"],
    possible: ["baidu-cloud-robotics", "hirain", "yongxing-beijing"],
  },
  "technical-project-manager": {
    core: ["robotera", "tiangong-center", "mech-mind"],
    adjacent: ["orionstar", "meituan-robotics", "jd-robotics"],
    possible: ["baidu-cloud-robotics", "honor-robotics", "horizon"],
  },
  "system-validation": {
    core: ["galbot", "galaxea-ai", "robotera"],
    adjacent: ["noetix", "booster", "tiangong-center", "linker-hand", "mech-mind"],
    possible: ["rokae", "aubo", "horizon", "hirain", "vbot", "newtonic-beijing", "yongxing-beijing"],
  },
  "quality-engineer": {
    core: ["robotera", "noetix", "booster"],
    adjacent: ["linker-hand", "mech-mind", "rokae", "aubo"],
    possible: ["horizon", "hirain", "vbot", "newtonic-beijing", "yongxing-beijing"],
  },
  "process-npi": {
    core: ["robotera", "noetix", "booster"],
    adjacent: ["linker-hand", "mech-mind", "rokae", "aubo"],
    possible: ["honor-robotics", "horizon", "hirain", "vbot", "newtonic-beijing", "yongxing-beijing", "wujie-power"],
  },
  "supply-chain-procurement": {
    core: ["robotera", "noetix", "booster"],
    adjacent: ["linker-hand", "mech-mind", "rokae", "aubo"],
    possible: ["honor-robotics", "horizon", "hirain", "vbot", "yongxing-beijing", "wujie-power"],
  },
  "sales-engineer": {
    core: ["mech-mind", "rokae", "aubo"],
    adjacent: ["orionstar", "yunji", "horizon"],
    possible: ["hirain", "yongxing-beijing", "booster", "casbot"],
  },
  "technical-marketing": {
    core: ["galbot", "mech-mind"],
    adjacent: ["orionstar", "yunji", "baidu-cloud-robotics", "horizon"],
    possible: ["honor-robotics", "tiangong-center", "gigaai", "roboscience"],
  },
  "business-development": {
    core: ["galbot", "mech-mind"],
    adjacent: ["galaxea-ai", "robotera", "orionstar", "yunji"],
    possible: ["tiangong-center", "meituan-robotics", "jd-robotics", "baidu-cloud-robotics", "worldstream", "baai"],
  },
};

const levelReason: Record<CompanyRoleFitLevel, string> = {
  core: "公司公开业务与该方向的核心工作场景高度一致；这是方向匹配判断，不代表正在招聘。",
  adjacent: "公司业务与该方向有相邻协作场景，需结合具体团队和职位描述核实。",
  possible: "从产品或行业链条看存在潜在关联，仅供扩展检索，不代表设有该岗位。",
};

export const companyRoleFits: CompanyRoleFit[] = Object.entries(seeds).flatMap(
  ([roleId, seed]) =>
    (["core", "adjacent", "possible"] as const).flatMap((level) =>
      (seed[level] ?? []).map((companyId) => ({
        roleId,
        companyId,
        level,
        reason: levelReason[level],
      })),
    ),
);
