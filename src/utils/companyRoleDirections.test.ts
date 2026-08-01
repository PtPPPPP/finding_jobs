import { describe, expect, it } from "vitest";
import { companies } from "../data/companies";
import { companyRoleFits } from "../data/companyRoleFits";
import { jobRoles } from "../data/jobRoles";
import { enrichCompaniesWithRoleDirections } from "./companyRoleDirections";

describe("enrichCompaniesWithRoleDirections", () => {
  it("adds canonical role directions and skills without duplicates", () => {
    const enriched = enrichCompaniesWithRoleDirections(companies, jobRoles, companyRoleFits);
    const mechMind = enriched.find((company) => company.id === "mech-mind");

    expect(mechMind?.roleDirections?.map(({ title }) => title)).toContain("解决方案工程师");
    expect(mechMind?.relatedRoleSkills).toContain("方案设计");
    expect(mechMind?.recommendedSkills).not.toContain("方案设计");
    expect(new Set(mechMind?.roleDirections?.map(({ roleId }) => roleId)).size).toBe(
      mechMind?.roleDirections?.length,
    );
    expect(new Set(mechMind?.recommendedSkills).size).toBe(
      mechMind?.recommendedSkills.length,
    );
  });

  it("gives every company at least one non-RD business-fit direction", () => {
    const nonRdCompanyIds = new Set(
      jobRoles
        .filter((role) => role.track !== "rd")
        .flatMap((role) =>
          companyRoleFits
            .filter((fit) => fit.roleId === role.id)
            .map((fit) => fit.companyId),
        ),
    );

    expect(
      companies.filter((company) => !nonRdCompanyIds.has(company.id)),
    ).toEqual([]);
  });
});
