import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { companies } from "../data/companies";
import { companyRoleFits } from "../data/companyRoleFits";
import { jobRoles } from "../data/jobRoles";
import { skillDefinitions } from "../data/skills";
import { CandidateComparison } from "./CandidateComparison";
import { FilterBar } from "./FilterBar";
import { SkillMatrix } from "./SkillMatrix";

describe("decision UI components", () => {
  it("auto-expands the selected skill group and keeps specialized skills folded", () => {
    render(
      <SkillMatrix
        skills={skillDefinitions}
        activeSkill="NPI"
        onSkillClick={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /制造与供应链/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /机器人与算法/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "FMEA" })).not.toBeInTheDocument();
  });

  it("allows a skill group to collapse independently", async () => {
    const user = userEvent.setup();
    render(
      <SkillMatrix
        skills={skillDefinitions}
        activeSkill="NPI"
        onSkillClick={vi.fn()}
      />,
    );
    const group = screen.getByRole("button", { name: /制造与供应链/ });
    await user.click(group);
    expect(group).toHaveAttribute("aria-expanded", "false");
  });

  it("renders comparison dimensions and supports remove and clear", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onClear = vi.fn();
    render(
      <CandidateComparison
        roles={jobRoles}
        companies={companies}
        fits={companyRoleFits}
        candidateRoleIds={["robot-product-manager", "solution-engineer"]}
        onRemove={onRemove}
        onClear={onClear}
      />,
    );
    for (const label of ["工作阶段", "核心产出", "责任边界", "技术深度", "核心关联公司"]) {
      expect(screen.getAllByText(label).length).toBe(2);
    }
    await user.click(screen.getByRole("button", { name: "移除机器人产品经理" }));
    expect(onRemove).toHaveBeenCalledWith("robot-product-manager");
    await user.click(screen.getByRole("button", { name: "清空候选" }));
    expect(onClear).toHaveBeenCalled();
  });

  it("shows a mobile filter summary and correct aria state", async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        filters={{ keyword: "", tier: "A", city: "全部", category: "", role: "", skill: "ROS2" }}
        sortKey="fitScore"
        cities={[]}
        categories={[]}
        roles={[]}
        skills={["ROS2"]}
        resultCount={3}
        onFiltersChange={vi.fn()}
        onSortChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    const toggle = screen.getByRole("button", { name: "更多筛选（2）" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("已启用 2 个筛选条件")).toBeInTheDocument();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
