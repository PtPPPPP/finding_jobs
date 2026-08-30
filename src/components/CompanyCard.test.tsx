import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Company } from "../types";
import { CompanyCard } from "./CompanyCard";

const companyFixture: Company = {
  id: "example-company",
  name: "示例公司",
  englishName: "Example Company",
  tier: "A",
  category: ["人形机器人"],
  cities: [{ city: "北京", presence: "总部" }],
  focus: ["机器人控制"],
  roleDirections: [
    { roleId: "robot-algorithm-intern", title: "机器人算法实习生", level: "core", reason: "测试关联" },
  ],
  recommendedSkills: ["C++"],
  fitScore: 4,
  undergraduateFriendlyScore: 4,
  reason: "用于前端组件测试。",
  applicationEntries: [
    {
      label: "官方招聘",
      url: "https://example.com/careers",
      type: "career",
    },
  ],
  lastUpdated: "2026-07-11",
  verificationStatus: "部分核验",
};

describe("CompanyCard", () => {
  it("uses a standalone button to expand company details", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(
      <CompanyCard company={companyFixture} expanded={false} onToggle={onToggle} />,
    );

    const button = screen.getByRole("button", { name: "展开示例公司详情" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button.querySelector("h3")).toBeNull();

    await user.click(button);
    expect(onToggle).toHaveBeenCalledWith(companyFixture.id);

    rerender(<CompanyCard company={companyFixture} expanded onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: "收起示例公司详情" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("does not toggle details when an application link is clicked", () => {
    const onToggle = vi.fn();
    render(<CompanyCard company={companyFixture} expanded onToggle={onToggle} />);
    const link = screen.getByRole("link", { name: "打开示例公司官方招聘页面" });
    link.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(link);

    expect(onToggle).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "收起示例公司详情" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
