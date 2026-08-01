import { describe, expect, it } from "vitest";
import { jobRoles } from "../data/jobRoles";
import { defaultJobRoleFilters } from "./filterQuery";
import { filterJobRoles } from "./filterJobRoles";

describe("filterJobRoles", () => {
  it.each([
    ["FAE", ["robot-application"]],
    ["FSE", ["field-service"]],
    ["NPI", ["process-npi"]],
    ["SQE", ["quality-engineer"]],
    ["CQE", ["quality-engineer"]],
    ["PMM", ["technical-marketing"]],
    ["CSM", ["customer-success"]],
    ["SLAM", ["slam-navigation"]],
    ["VLA", ["vla-multimodal"]],
  ])("resolves exact role alias %s without substring spillover", (keyword, roleIds) => {
    const result = filterJobRoles(jobRoles, {
      ...defaultJobRoleFilters,
      keyword,
    });

    expect(result.map((role) => role.id)).toEqual(roleIds);
  });

  it("keeps PM limited to product and technical project management", () => {
    const result = filterJobRoles(jobRoles, {
      ...defaultJobRoleFilters,
      keyword: "PM",
    });

    expect(result.map((role) => role.id)).toEqual([
      "robot-product-manager",
      "technical-project-manager",
    ]);
    expect(result.map((role) => role.id)).not.toContain("technical-marketing");
  });

  it("keeps ambiguous SE mapped to solution, pre-sales and sales only", () => {
    const result = filterJobRoles(jobRoles, {
      ...defaultJobRoleFilters,
      keyword: "SE",
    });

    expect(result.map((role) => role.id)).toEqual([
      "solution-engineer",
      "pre-sales-engineer",
      "sales-engineer",
    ]);
    expect(result.map((role) => role.id)).not.toContain("field-service");
  });
});
