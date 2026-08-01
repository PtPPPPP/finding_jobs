import { describe, expect, it } from "vitest";
import { companies } from "../data/companies";
import { companyRoleFits } from "../data/companyRoleFits";
import { jobRoles } from "../data/jobRoles";
import { skillDefinitions, skills } from "../data/skills";
import {
  defaultCompanyFilters,
  defaultDecisionQueryState,
  defaultJobRoleFilters,
  parseFilterQuery,
  serializeFilterQuery,
} from "./filterQuery";
import { enrichCompaniesWithRoleDirections } from "./companyRoleDirections";
import { filterCompanies } from "./filterCompanies";
import { getQuickPickResults } from "./quickPick";
import { scoreJobRoleForPreferences } from "./quickPick";

const queryOptions = {
  categories: [...new Set(companies.flatMap(({ category }) => category))],
  roles: jobRoles.map(({ title }) => title),
  skills,
  jobFunctions: [...new Set(jobRoles.map(({ functionType }) => functionType))],
  jobTracks: [...new Set(jobRoles.map(({ track }) => track))],
  jobRoleIds: jobRoles.map(({ id }) => id),
};

describe("decision capability data contract", () => {
  it("keeps company core skills separate from derived role skills and filtering", () => {
    const enriched = enrichCompaniesWithRoleDirections(companies, jobRoles, companyRoleFits);
    const original = companies.find(({ id }) => id === "mech-mind")!;
    const derived = enriched.find(({ id }) => id === "mech-mind")!;

    expect(derived.recommendedSkills).toEqual(original.recommendedSkills);
    expect(derived.relatedRoleSkills?.length).toBeGreaterThan(derived.recommendedSkills.length);
    expect(filterCompanies(enriched, { skill: "方案设计" })).not.toContainEqual(derived);
    expect(derived.relatedRoleSkillsByLevel?.core.length).toBeGreaterThan(0);
    expect(derived.relatedRoleSkillsByLevel).toHaveProperty("possible");
  });

  it("keeps every relation legal, explained, resolvable and strength-sorted", () => {
    const companyIds = new Set(companies.map(({ id }) => id));
    const roleIds = new Set(jobRoles.map(({ id }) => id));
    expect(companyRoleFits.every(({ level }) => ["core", "adjacent", "possible"].includes(level))).toBe(true);
    expect(companyRoleFits.every(({ reason }) => reason.trim().length > 0)).toBe(true);
    expect(companyRoleFits.every(({ companyId, roleId }) => companyIds.has(companyId) && roleIds.has(roleId))).toBe(true);

    const enriched = enrichCompaniesWithRoleDirections(companies, jobRoles, companyRoleFits);
    const order = { core: 0, adjacent: 1, possible: 2 };
    expect(
      enriched.every(({ roleDirections = [] }) =>
        roleDirections.every((direction, index) =>
          index === 0 || order[roleDirections[index - 1].level] <= order[direction.level],
        ),
      ),
    ).toBe(true);
  });

  it("assigns each of 59 skills to exactly one group and uses every skill", () => {
    expect(skillDefinitions).toHaveLength(59);
    expect(new Set(skillDefinitions.map(({ name }) => name)).size).toBe(59);
    expect(new Set(skillDefinitions.map(({ group }) => group)).size).toBe(7);
    const searchableData = JSON.stringify({ companies, jobRoles });
    expect(skillDefinitions.filter(({ name }) => !searchableData.includes(`"${name}"`))).toEqual([]);
    expect(skills).not.toContain("产品/方案能力");
    expect(jobRoles.some((role) => [...role.requiredSkills, ...role.niceToHaveSkills].includes("嵌入式"))).toBe(true);
  });

  it("separates two graduate entry umbrellas and completes high-overlap boundaries", () => {
    expect(jobRoles.filter(({ roleKind }) => roleKind === "graduate-entry").map(({ id }) => id)).toEqual([
      "robot-algorithm-intern",
      "pm-solution",
    ]);
    const overlapIds = [
      "robot-test",
      "robot-application",
      "robot-product-manager",
      "solution-engineer",
      "pre-sales-engineer",
      "project-implementation",
      "project-delivery",
      "technical-project-manager",
      "system-validation",
      "quality-engineer",
      "process-npi",
      "supply-chain-procurement",
    ];
    expect(
      overlapIds.every((id) => {
        const role = jobRoles.find((item) => item.id === id);
        return role?.workflowStage && role.primaryDeliverables?.length && role.accountability;
      }),
    ).toBe(true);
  });

  it("returns 3 to 5 stable, explained formal directions and reports relaxation", () => {
    const preferences = {
      workType: "manufacturing",
      travel: "low",
      workStyle: "independent",
      technicalDepth: "deep",
      entryPriority: "easy",
    } as const;
    const first = getQuickPickResults(jobRoles, preferences);
    const second = getQuickPickResults(jobRoles, preferences);
    expect(first.matches.length).toBeGreaterThanOrEqual(3);
    expect(first.matches.length).toBeLessThanOrEqual(5);
    expect(first.matches.map(({ role }) => role.id)).toEqual(second.matches.map(({ role }) => role.id));
    expect(first.matches.every(({ role, reasons, challenge }) =>
      role.roleKind === "career-direction" && reasons.length > 0 && challenge.length > 0,
    )).toBe(true);
    expect(first.relaxations.length).toBeGreaterThan(0);
    const scored = scoreJobRoleForPreferences(jobRoles[0], preferences);
    expect(scored.score).toBeTypeOf("number");
    expect(scored.challenge.length).toBeGreaterThan(0);
  });

  it("round-trips at most five valid candidates and all core preferences", () => {
    const candidateRoleIds = [
      "robot-product-manager",
      "solution-engineer",
      "pre-sales-engineer",
      "project-delivery",
      "quality-engineer",
    ];
    const quickPickPreferences = {
      workType: "customer",
      travel: "some",
      workStyle: "coordination",
      technicalDepth: "balanced",
      entryPriority: "long-term",
    } as const;
    const query = serializeFilterQuery(
      defaultCompanyFilters,
      "fitScore",
      defaultJobRoleFilters,
      { candidateRoleIds, quickPickPreferences },
    );
    expect(parseFilterQuery(`${query}&candidateRoles=${candidateRoleIds.join(",")},bad,robot-test`, queryOptions).decisionState)
      .toEqual({ candidateRoleIds, quickPickPreferences });
  });

  it("ignores illegal candidate ids and restores defaults when decision state is absent", () => {
    expect(parseFilterQuery("?candidateRoles=bad,missing", queryOptions).decisionState)
      .toEqual(defaultDecisionQueryState);
    expect(
      parseFilterQuery(
        "?candidateRoles=robot-product-manager,solution-engineer,pre-sales-engineer,project-delivery,quality-engineer,robot-test,bad",
        queryOptions,
      ).decisionState.candidateRoleIds,
    ).toEqual([
      "robot-product-manager",
      "solution-engineer",
      "pre-sales-engineer",
      "project-delivery",
      "quality-engineer",
    ]);
  });

  it("can restrict shared candidates to formal career directions", () => {
    const parsed = parseFilterQuery(
      "?candidateRoles=robot-algorithm-intern,robot-product-manager",
      { ...queryOptions, candidateRoleIds: ["robot-product-manager"] },
    );
    expect(parsed.decisionState.candidateRoleIds).toEqual(["robot-product-manager"]);
  });
});
