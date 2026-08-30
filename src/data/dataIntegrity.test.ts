import { describe, expect, it } from "vitest";
import { companies } from "./companies";
import { companyRoleFits } from "./companyRoleFits";
import { jobFunctions, jobTracks } from "./jobFunctions";
import { jobRoles } from "./jobRoles";
import { skills } from "./skills";

const findDuplicates = (values: string[]) => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }
    seen.add(value);
  });

  return [...duplicates];
};

const isBlank = (value: string) => value.trim().length === 0;

const APPLICATION_ENTRY_TYPES = new Set([
  "career",
  "campus",
  "internship",
  "experienced",
  "other",
]);

const EXPANDED_NON_RD_ROLE_IDS = new Set([
  "robot-application",
  "robot-product-manager",
  "solution-engineer",
  "pre-sales-engineer",
  "technical-support",
  "field-service",
  "customer-success",
  "project-implementation",
  "project-delivery",
  "technical-project-manager",
  "system-validation",
  "quality-engineer",
  "process-npi",
  "supply-chain-procurement",
  "sales-engineer",
  "technical-marketing",
  "business-development",
]);

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

// 仅格式正确还不够：必须校验为真实日历日期（如 2026-02-30 应判非法）。
const isValidCalendarDate = (value: string): boolean => {
  const match = DATE_REGEX.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]); // 1-12
  const day = Number(match[3]); // 1-31
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
};

const isFutureDate = (value: string): boolean => {
  if (!isValidCalendarDate(value)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return target.getTime() > today.getTime();
};

const isValidHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

describe("data integrity", () => {
  it("keeps all company recommended skills in the shared skill matrix", () => {
    const skillSet = new Set(skills);
    const missingSkills = companies.flatMap((company) =>
      company.recommendedSkills
        .filter((skill) => !skillSet.has(skill))
        .map((skill) => `${company.name}: ${skill}`),
    );

    expect(missingSkills).toEqual([]);
  });

  it("keeps all job role skills in the shared skill matrix", () => {
    const skillSet = new Set(skills);
    const missingSkills = jobRoles.flatMap((role) =>
      [...role.requiredSkills, ...role.niceToHaveSkills]
        .filter((skill) => !skillSet.has(skill))
        .map((skill) => `${role.title}: ${skill}`),
    );

    expect(missingSkills).toEqual([]);
  });

  it("keeps all related company ids valid", () => {
    const companyIds = new Set(companies.map((company) => company.id));
    const missingCompanyIds = companyRoleFits
      .filter(({ companyId }) => !companyIds.has(companyId))
      .map(({ roleId, companyId }) => `${roleId}: ${companyId}`);

    expect(missingCompanyIds).toEqual([]);
  });

  it("keeps all company role references valid", () => {
    const roleIds = new Set(jobRoles.map((role) => role.id));
    const missingRoleTitles = companyRoleFits
      .filter(({ roleId }) => !roleIds.has(roleId))
      .map(({ companyId, roleId }) => `${companyId}: ${roleId}`);

    expect(missingRoleTitles).toEqual([]);
  });

  it("keeps core ids and names unique", () => {
    expect(findDuplicates(companies.map((company) => company.id))).toEqual([]);
    expect(findDuplicates(companies.map((company) => company.name))).toEqual([]);
    expect(findDuplicates(jobRoles.map((role) => role.id))).toEqual([]);
    expect(findDuplicates(jobRoles.map((role) => role.title))).toEqual([]);
    expect(findDuplicates(skills)).toEqual([]);
  });

  it("keeps required display fields non-empty", () => {
    const blankFields = [
      ...companies.flatMap((company) => [
        [company.name, `${company.id}: name`] as const,
        [company.id, `${company.name}: id`] as const,
        [company.focus.join(""), `${company.name}: focus`] as const,
      ]),
      ...jobRoles.flatMap((role) => [
        [role.id, `${role.title}: id`] as const,
        [role.title, `${role.id}: title`] as const,
      ]),
      ...skills.map((skill) => [skill, "skill"] as const),
    ]
      .filter(([value]) => isBlank(value))
      .map(([, label]) => label);

    expect(blankFields).toEqual([]);
  });
});

describe("job role taxonomy integrity", () => {
  it("uses only supported function and track values", () => {
    const invalid = jobRoles.flatMap((role) => {
      const issues: string[] = [];
      if (!jobFunctions.includes(role.functionType)) {
        issues.push(`${role.id}: functionType=${role.functionType}`);
      }
      if (!jobTracks.includes(role.track)) {
        issues.push(`${role.id}: track=${role.track}`);
      }
      return issues;
    });

    expect(invalid).toEqual([]);
  });

  it("keeps common titles and required role content non-empty", () => {
    const incomplete = jobRoles.flatMap((role) => {
      const fields = [
        [role.description, "description"],
        [role.commonTitles.join(""), "commonTitles"],
        [role.typicalResponsibilities.join(""), "typicalResponsibilities"],
        [role.suitableMajors.join(""), "suitableMajors"],
        [role.suitableTraits.join(""), "suitableTraits"],
        [role.challenges.join(""), "challenges"],
        [role.requiredSkills.join(""), "requiredSkills"],
        [role.resumeProjectIdeas.join(""), "resumeProjectIdeas"],
        [
          companyRoleFits.filter(({ roleId }) => roleId === role.id).map(({ companyId }) => companyId).join(""),
          "companyRoleFits",
        ],
      ] as const;

      return fields
        .filter(([value]) => isBlank(value))
        .map(([, field]) => `${role.id}: ${field}`);
    });

    const blankCommonTitles = jobRoles.flatMap((role) =>
      role.commonTitles
        .filter(isBlank)
        .map((_, index) => `${role.id}: commonTitles[${index}]`),
    );

    expect([...incomplete, ...blankCommonTitles]).toEqual([]);
  });

  it("explains automation-student advantages and gaps for expanded roles", () => {
    const incomplete = jobRoles
      .filter((role) => EXPANDED_NON_RD_ROLE_IDS.has(role.id))
      .filter(
        (role) =>
          !role.automationStudentFit ||
          role.automationStudentFit.some(isBlank) ||
          !role.automationStudentFit.some((item) => item.startsWith("优势：")) ||
          !role.automationStudentFit.some((item) => item.startsWith("需补足：")),
      )
      .map((role) => role.id);

    expect(incomplete).toEqual([]);
  });

  it("keeps every role profile score within 1..5", () => {
    const scoreFields = [
      "technicalDepth",
      "communicationIntensity",
      "travelIntensity",
      "coordinationIntensity",
      "entryLevelFit",
    ] as const;
    const outOfRange = jobRoles.flatMap((role) =>
      scoreFields
        .filter((field) => role[field] < 1 || role[field] > 5)
        .map((field) => `${role.id}: ${field}=${role[field]}`),
    );

    expect(outOfRange).toEqual([]);
  });

  it("keeps transition references valid", () => {
    const roleIds = new Set(jobRoles.map((role) => role.id));
    const invalid = jobRoles.flatMap((role) =>
      [...role.transitionFrom, ...role.transitionTo]
        .filter((roleId) => !roleIds.has(roleId))
        .map((roleId) => `${role.id}: ${roleId}`),
    );

    expect(invalid).toEqual([]);
  });

  it("keeps every function and top-level track represented", () => {
    const emptyFunctions = jobFunctions.filter(
      (functionType) =>
        !jobRoles.some((role) => role.functionType === functionType),
    );
    const emptyTracks = jobTracks.filter(
      (track) => !jobRoles.some((role) => role.track === track),
    );

    expect(emptyFunctions).toEqual([]);
    expect(emptyTracks).toEqual([]);
  });

  it("meets the multi-function role coverage target", () => {
    expect(jobRoles.length).toBeGreaterThanOrEqual(23);
    expect(jobRoles.filter((role) => role.track !== "rd").length).toBeGreaterThanOrEqual(10);
    expect(new Set(jobRoles.map((role) => role.functionType)).size).toBeGreaterThanOrEqual(7);
  });
});

describe("company verification & application entry integrity", () => {
  it("keeps fit and undergraduate-friendly scores within 1..5", () => {
    const outOfRange = companies.flatMap((company) => {
      const offenders: string[] = [];
      if (company.fitScore < 1 || company.fitScore > 5) {
        offenders.push(`${company.id}: fitScore=${company.fitScore}`);
      }
      if (
        company.undergraduateFriendlyScore < 1 ||
        company.undergraduateFriendlyScore > 5
      ) {
        offenders.push(
          `${company.id}: undergraduateFriendlyScore=${company.undergraduateFriendlyScore}`,
        );
      }
      return offenders;
    });

    expect(outOfRange).toEqual([]);
  });

  it("keeps all verification and update dates in YYYY-MM-DD form", () => {
    const malformed: string[] = [];
    companies.forEach((company) => {
      if (company.lastUpdated && !DATE_REGEX.test(company.lastUpdated)) {
        malformed.push(`${company.id}: lastUpdated=${company.lastUpdated}`);
      }
      if (company.lastVerifiedAt && !DATE_REGEX.test(company.lastVerifiedAt)) {
        malformed.push(`${company.id}: lastVerifiedAt=${company.lastVerifiedAt}`);
      }
    });
    companies.forEach((company) => {
      (company.applicationEntries ?? []).forEach((entry, index) => {
        if (entry.verifiedAt && !DATE_REGEX.test(entry.verifiedAt)) {
          malformed.push(`${company.id}: applicationEntries[${index}].verifiedAt=${entry.verifiedAt}`);
        }
      });
    });

    expect(malformed).toEqual([]);
  });

  it("rejects impossible calendar dates such as 2026-02-30", () => {
    const invalid: string[] = [];
    companies.forEach((company) => {
      if (company.lastUpdated && !isValidCalendarDate(company.lastUpdated)) {
        invalid.push(`${company.id}: lastUpdated=${company.lastUpdated}`);
      }
      if (company.lastVerifiedAt && !isValidCalendarDate(company.lastVerifiedAt)) {
        invalid.push(`${company.id}: lastVerifiedAt=${company.lastVerifiedAt}`);
      }
    });
    companies.forEach((company) => {
      (company.applicationEntries ?? []).forEach((entry, index) => {
        if (entry.verifiedAt && !isValidCalendarDate(entry.verifiedAt)) {
          invalid.push(`${company.id}: applicationEntries[${index}].verifiedAt=${entry.verifiedAt}`);
        }
      });
    });

    expect(invalid).toEqual([]);
  });

  it("does not allow verification dates in the future", () => {
    const future: string[] = [];
    companies.forEach((company) => {
      if (company.lastVerifiedAt && isFutureDate(company.lastVerifiedAt)) {
        future.push(`${company.id}: lastVerifiedAt=${company.lastVerifiedAt}`);
      }
    });
    companies.forEach((company) => {
      (company.applicationEntries ?? []).forEach((entry, index) => {
        if (entry.verifiedAt && isFutureDate(entry.verifiedAt)) {
          future.push(`${company.id}: applicationEntries[${index}].verifiedAt=${entry.verifiedAt}`);
        }
      });
    });

    expect(future).toEqual([]);
  });

  it("keeps every populated link field a valid http(s) URL", () => {
    const invalid: string[] = [];
    companies.forEach((company) => {
      if (company.websiteUrl && !isValidHttpUrl(company.websiteUrl)) {
        invalid.push(`${company.id}: websiteUrl=${company.websiteUrl}`);
      }
      if (company.careerUrl && !isValidHttpUrl(company.careerUrl)) {
        invalid.push(`${company.id}: careerUrl=${company.careerUrl}`);
      }
      (company.sourceLinks ?? []).forEach((url, index) => {
        if (!isValidHttpUrl(url)) {
          invalid.push(`${company.id}: sourceLinks[${index}]=${url}`);
        }
      });
    });
    companies.forEach((company) => {
      (company.applicationEntries ?? []).forEach((entry, index) => {
        if (!isValidHttpUrl(entry.url)) {
          invalid.push(`${company.id}: applicationEntries[${index}].url=${entry.url}`);
        }
      });
    });

    expect(invalid).toEqual([]);
  });

  it("keeps applicationEntries well-formed and non-duplicating", () => {
    const issues: string[] = [];
    companies.forEach((company) => {
      const entries = company.applicationEntries ?? [];
      const seenUrls = new Set<string>();
      entries.forEach((entry, index) => {
        const location = `${company.id}: applicationEntries[${index}]`;
        if (isBlank(entry.label)) {
          issues.push(`${location}: empty label`);
        }
        if (isBlank(entry.url)) {
          issues.push(`${location}: empty url`);
        }
        if (entry.url === "#" || entry.url.startsWith("javascript:")) {
          issues.push(`${location}: placeholder url=${entry.url}`);
        }
        if (!APPLICATION_ENTRY_TYPES.has(entry.type)) {
          issues.push(`${location}: invalid type=${entry.type}`);
        }
        if (seenUrls.has(entry.url)) {
          issues.push(`${location}: duplicate url=${entry.url}`);
        }
        seenUrls.add(entry.url);
      });
    });

    expect(issues).toEqual([]);
  });

  it("requires sources and a verification date for any non-pending company", () => {
    const incomplete = companies
      .filter((company) => company.verificationStatus !== "待核验")
      .filter(
        (company) =>
          isBlank(company.lastVerifiedAt ?? "") ||
          (company.sourceLinks ?? []).length === 0,
      )
      .map(
        (company) =>
          `${company.id}: status=${company.verificationStatus}`,
      );

    expect(incomplete).toEqual([]);
  });

  it("keeps company core display fields complete", () => {
    const incomplete = companies.flatMap((company) => {
      const offenders: string[] = [];
      if (isBlank(company.id)) offenders.push(`${company.name}: id`);
      if (isBlank(company.name)) offenders.push(`${company.id}: name`);
      if (isBlank(company.reason)) offenders.push(`${company.id}: reason`);
      if (company.category.length === 0) offenders.push(`${company.id}: category`);
      if (company.focus.length === 0) offenders.push(`${company.id}: focus`);
      if (!companyRoleFits.some(({ companyId }) => companyId === company.id)) {
        offenders.push(`${company.id}: companyRoleFits`);
      }
      if (company.recommendedSkills.length === 0) offenders.push(`${company.id}: recommendedSkills`);
      if (
        company.cities.length === 0 ||
        company.cities.some(({ city }) => isBlank(city))
      ) {
        offenders.push(`${company.id}: cities`);
      }
      return offenders;
    });

    expect(incomplete).toEqual([]);
  });
});
