import { describe, expect, it } from "vitest";
import type { Company } from "../types";
import { filterCompanies } from "./filterCompanies";
import { sortCompanies } from "./sortCompanies";

const sampleCompanies: Company[] = [
  {
    id: "alpha",
    name: "阿尔法机器人",
    englishName: "Alpha Robotics",
    tier: "S",
    category: ["人形机器人"],
    beijingRelevance: "北京总部",
    focus: ["运动控制", "VLA"],
    roleDirections: [
      { roleId: "robot-algorithm-intern", title: "机器人算法实习生", level: "core", reason: "测试关联" },
      { roleId: "vla-multimodal", title: "VLA/多模态大模型实习生", level: "adjacent", reason: "测试关联" },
    ],
    recommendedSkills: ["Python", "ROS2", "强化学习"],
    fitScore: 5,
    undergraduateFriendlyScore: 4,
    reason: "方向集中，适合算法型学生。",
    risks: "门槛较高，需要准备控制和学习算法项目。",
    lastUpdated: "2026-06-29",
    verificationStatus: "待核验",
  },
  {
    id: "beta",
    name: "贝塔视觉",
    englishName: "Beta Vision",
    tier: "B",
    category: ["机器人视觉"],
    beijingRelevance: "北京研发中心",
    focus: ["机器人视觉", "SLAM"],
    roleDirections: [
      { roleId: "vision-algorithm", title: "视觉算法实习生", level: "core", reason: "测试关联" },
      { roleId: "slam-navigation", title: "SLAM/导航算法实习生", level: "adjacent", reason: "测试关联" },
    ],
    recommendedSkills: ["OpenCV", "SLAM", "C++"],
    fitScore: 3,
    undergraduateFriendlyScore: 5,
    reason: "视觉任务明确，项目切入容易。",
    lastUpdated: "2026-06-29",
    verificationStatus: "待核验",
  },
];

describe("filterCompanies", () => {
  it("filters by keyword across Chinese and English fields", () => {
    const result = filterCompanies(sampleCompanies, { keyword: "vision" });
    expect(result.map((company) => company.id)).toEqual(["beta"]);
  });

  it("combines tier, role, and skill filters", () => {
    const result = filterCompanies(sampleCompanies, {
      tier: "S",
      role: "机器人算法实习生",
      skill: "ROS2",
    });
    expect(result.map((company) => company.id)).toEqual(["alpha"]);
  });

  it("supports RL as an alias for reinforcement learning skills", () => {
    const result = filterCompanies(sampleCompanies, { keyword: "RL" });
    expect(result.map((company) => company.id)).toEqual(["alpha"]);
  });

  it("supports CV as an alias for vision-related companies", () => {
    const result = filterCompanies(sampleCompanies, { keyword: "CV" });
    expect(result.map((company) => company.id)).toEqual(["beta"]);
  });

  it("searches risk and project-facing text fields", () => {
    const result = filterCompanies(sampleCompanies, { keyword: "门槛较高" });
    expect(result.map((company) => company.id)).toEqual(["alpha"]);
  });
});

describe("sortCompanies", () => {
  it("sorts by fit score descending", () => {
    const result = sortCompanies(sampleCompanies, "fitScore");
    expect(result.map((company) => company.id)).toEqual(["alpha", "beta"]);
  });

  it("sorts by undergraduate friendly score descending", () => {
    const result = sortCompanies(sampleCompanies, "undergraduateFriendlyScore");
    expect(result.map((company) => company.id)).toEqual(["beta", "alpha"]);
  });
});
