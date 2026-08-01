import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { companies } from "../data/companies";
import { companyRoleFits } from "../data/companyRoleFits";
import { jobRoles } from "../data/jobRoles";
import type { JobRoleFilters } from "../types";
import { defaultJobRoleFilters } from "../utils/filterQuery";
import { JobRoleSection } from "./JobRoleSection";

function RoleHarness({
  onCompanySelect = vi.fn(),
}: {
  onCompanySelect?: (companyId: string) => void;
}) {
  const [filters, setFilters] = useState<JobRoleFilters>(
    defaultJobRoleFilters,
  );

  return (
    <JobRoleSection
      roles={jobRoles}
      companies={companies}
      fits={companyRoleFits}
      activeSkill=""
      filters={filters}
      candidateRoleIds={[]}
      onFiltersChange={(nextFilters) => setFilters(nextFilters)}
      onCompanySelect={onCompanySelect}
      onToggleCandidate={vi.fn()}
    />
  );
}

describe("JobRoleSection", () => {
  it("filters to product and solution roles", async () => {
    const user = userEvent.setup();
    render(<RoleHarness />);

    await user.click(
      screen.getByRole("button", { name: "产品与解决方案" }),
    );

    expect(
      screen.getByRole("heading", { name: "机器人产品经理" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "FAE / 应用工程师" }),
    ).not.toBeInTheDocument();
  });

  it("shows FAE and technical support in technical service", async () => {
    const user = userEvent.setup();
    render(<RoleHarness />);

    await user.click(screen.getByRole("button", { name: "技术服务" }));

    expect(
      screen.getByRole("heading", { name: "FAE / 应用工程师" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "技术支持工程师" }),
    ).toBeInTheDocument();
  });

  it("hides pure algorithm roles in the technical non-RD track", async () => {
    const user = userEvent.setup();
    render(<RoleHarness />);

    await user.click(
      screen.getByRole("button", { name: "技术非研发岗" }),
    );

    expect(
      screen.getByRole("heading", { name: "系统验证工程师" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "机器人算法实习生" }),
    ).not.toBeInTheDocument();
  });

  it("finds the application engineer by FAE alias", async () => {
    const user = userEvent.setup();
    render(<RoleHarness />);

    await user.type(screen.getByLabelText("搜索职业方向"), "FAE");

    expect(
      screen.getByRole("heading", { name: "FAE / 应用工程师" }),
    ).toBeInTheDocument();
  });

  it("finds the process role by NPI alias", async () => {
    const user = userEvent.setup();
    render(<RoleHarness />);

    await user.type(screen.getByLabelText("搜索职业方向"), "NPI");

    expect(
      screen.getByRole("heading", { name: "工艺与 NPI 工程师" }),
    ).toBeInTheDocument();
  });

  it("shows disambiguation choices for PM without suggesting PMM", async () => {
    const user = userEvent.setup();
    render(<RoleHarness />);
    await user.type(screen.getByLabelText("搜索职业方向"), "PM");
    expect(screen.getByText(/PM 可能指产品经理/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "产品经理" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "技术项目经理" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "技术市场 / 产品市场" })).not.toBeInTheDocument();
  });

  it("finds the sales engineer by its formal title", async () => {
    const user = userEvent.setup();
    render(<RoleHarness />);

    await user.type(
      screen.getByLabelText("搜索职业方向"),
      "销售工程师",
    );

    expect(
      screen.getByRole("heading", { name: "销售工程师" }),
    ).toBeInTheDocument();
  });

  it("expands a role to show responsibilities, traits, and common titles", async () => {
    const user = userEvent.setup();
    render(<RoleHarness />);

    await user.type(screen.getByLabelText("搜索职业方向"), "FAE");
    await user.click(
      screen.getByRole("button", { name: "展开FAE / 应用工程师详情" }),
    );
    await user.click(screen.getByRole("button", { name: /是否适合/ }));

    expect(screen.getByText("主要职责")).toBeInTheDocument();
    expect(screen.getByText("适合人群")).toBeInTheDocument();
    expect(screen.getByText("常见标题")).toBeInTheDocument();
    expect(screen.getByText("自动化专业视角")).toBeInTheDocument();
  });

  it("passes the related company id back to the company navigator", async () => {
    const user = userEvent.setup();
    const onCompanySelect = vi.fn();
    render(<RoleHarness onCompanySelect={onCompanySelect} />);

    await user.type(screen.getByLabelText("搜索职业方向"), "FAE");
    await user.click(
      screen.getByRole("button", { name: "展开FAE / 应用工程师详情" }),
    );
    await user.click(screen.getByRole("button", { name: /如何准备/ }));
    await user.click(
      screen.getByRole("button", { name: "查看相关公司梅卡曼德" }),
    );

    expect(onCompanySelect).toHaveBeenCalledWith("mech-mind");
  });

  it("opens only the first of three detail groups by default", async () => {
    const user = userEvent.setup();
    render(<RoleHarness />);
    await user.type(screen.getByLabelText("搜索职业方向"), "FAE");
    await user.click(screen.getByRole("button", { name: "展开FAE / 应用工程师详情" }));
    expect(screen.getByRole("button", { name: /做什么/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /是否适合/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /如何准备/ })).toHaveAttribute("aria-expanded", "false");
  });
});
