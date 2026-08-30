import { describe, expect, it } from "vitest";
import {
  defaultCompanyFilters,
  defaultDecisionQueryState,
  defaultJobRoleFilters,
  parseFilterQuery,
  serializeFilterQuery,
} from "./filterQuery";

const options = {
  cities: ["北京", "杭州", "上海"],
  categories: ["人形机器人", "机器人视觉"],
  roles: ["机器人算法实习生", "视觉算法实习生"],
  skills: ["ROS2", "Python"],
  jobFunctions: ["research-development", "technical-service"] as const,
  jobTracks: ["rd", "technical-non-rd"] as const,
  jobRoleIds: ["robot-algorithm-intern", "robot-application"],
};

describe("filter query state", () => {
  it("parses legal query values into filter state", () => {
    const state = parseFilterQuery(
      "?keyword=机器人&skill=ROS2&tier=A&city=杭州&category=人形机器人&role=机器人算法实习生&sort=undergraduateFriendlyScore",
      options,
    );

    expect(state).toEqual({
      filters: {
        keyword: "机器人",
        tier: "A",
        city: "杭州",
        category: "人形机器人",
        role: "机器人算法实习生",
        skill: "ROS2",
      },
      sortKey: "undergraduateFriendlyScore",
      jobRoleFilters: defaultJobRoleFilters,
      decisionState: defaultDecisionQueryState,
    });
  });

  it("falls back to defaults for illegal query values", () => {
    const state = parseFilterQuery(
      "?skill=不存在&tier=Z&city=火星&category=不存在&role=不存在&sort=bad",
      options,
    );

    expect(state).toEqual({
      filters: defaultCompanyFilters,
      sortKey: "fitScore",
      jobRoleFilters: defaultJobRoleFilters,
      decisionState: defaultDecisionQueryState,
    });
  });

  it("omits default values when serializing", () => {
    expect(serializeFilterQuery(defaultCompanyFilters, "fitScore")).toBe("");
  });

  it("serializes only active filter and sort values", () => {
    const query = serializeFilterQuery(
      {
        ...defaultCompanyFilters,
        keyword: "机器人",
        skill: "ROS2",
        tier: "A",
      },
      "tier",
    );

    expect(query).toBe(
      "?keyword=%E6%9C%BA%E5%99%A8%E4%BA%BA&tier=A&skill=ROS2&sort=tier",
    );
  });

  it.each([
    "C++ & AI",
    "R&D",
    "ROS2/C++",
    "视觉 + 控制",
    "中文 & English",
  ])("round-trips special-character keyword %s", (keyword) => {
    const query = serializeFilterQuery(
      { ...defaultCompanyFilters, keyword },
      "fitScore",
    );

    expect(parseFilterQuery(query, options).filters.keyword).toBe(keyword);
  });

  it("round-trips job role filters without changing company filters", () => {
    const query = serializeFilterQuery(
      { ...defaultCompanyFilters, tier: "A" },
      "fitScore",
      {
        keyword: "FAE",
        functionType: "technical-service",
        track: "technical-non-rd",
        roleId: "robot-application",
      },
    );

    expect(parseFilterQuery(query, options)).toEqual({
      filters: { ...defaultCompanyFilters, tier: "A" },
      sortKey: "fitScore",
      jobRoleFilters: {
        keyword: "FAE",
        functionType: "technical-service",
        track: "technical-non-rd",
        roleId: "robot-application",
      },
      decisionState: defaultDecisionQueryState,
    });
  });

  it("omits default job role filters and rejects illegal values", () => {
    expect(
      serializeFilterQuery(
        defaultCompanyFilters,
        "fitScore",
        defaultJobRoleFilters,
      ),
    ).toBe("");

    expect(
      parseFilterQuery(
        "?jobFunction=bad&roleTrack=bad&jobRole=bad",
        options,
      ).jobRoleFilters,
    ).toEqual(defaultJobRoleFilters);
  });
});
