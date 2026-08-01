import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App interactions", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("filters companies when a skill tag is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    const companyRadar = screen.getByRole("main");
    const initialCompanyCount = within(companyRadar).getAllByRole("button", {
      name: /展开.*详情/,
    }).length;
    await user.click(screen.getByRole("button", { name: "ROS2" }));

    await waitFor(() => {
      expect(window.location.search).toContain("skill=ROS2");
    });
    expect(
      screen.getByText("同时按技能「ROS2」筛选岗位方向。"),
    ).toBeInTheDocument();
    expect(
      within(companyRadar).getAllByRole("button", { name: /展开.*详情/ }).length,
    ).toBeLessThan(initialCompanyCount);
    expect(
      within(companyRadar).getByRole("button", { name: /展开星海图详情/ }),
    ).toBeInTheDocument();
  });

  it("resets filters and clears the URL query", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("关键词搜索"), "机器人");
    await user.selectOptions(screen.getByLabelText("按梯队筛选"), "A");
    await user.selectOptions(screen.getByLabelText("按技能筛选"), "ROS2");
    await user.click(screen.getByRole("button", { name: "技术服务" }));
    await waitFor(() => {
      expect(window.location.search).not.toBe("");
    });

    await user.click(screen.getByRole("button", { name: "重置所有筛选条件" }));

    await waitFor(() => {
      expect(window.location.search).toBe("");
    });
    expect(screen.getByLabelText("关键词搜索")).toHaveValue("");
    expect(screen.getByLabelText("按梯队筛选")).toHaveValue("全部");
    expect(screen.getByLabelText("按技能筛选")).toHaveValue("");
    expect(screen.getByRole("button", { name: "全部职能" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("expands and collapses a company card with aria-expanded state", async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggleButton = screen.getByRole("button", { name: /展开银河通用详情/ });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    await user.click(toggleButton);

    expect(
      screen.getByRole("button", { name: /收起银河通用详情/ }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("推荐投递理由")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /收起银河通用详情/ }));

    expect(
      screen.getByRole("button", { name: /展开银河通用详情/ }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("replaces history for keyword input and pushes discrete filters", async () => {
    const user = userEvent.setup();
    const pushState = vi.spyOn(window.history, "pushState");
    const replaceState = vi.spyOn(window.history, "replaceState");
    render(<App />);

    await user.type(screen.getByLabelText("关键词搜索"), "AI");

    expect(replaceState).toHaveBeenCalled();
    expect(pushState).not.toHaveBeenCalled();

    await user.selectOptions(screen.getByLabelText("按梯队筛选"), "A");

    await waitFor(() => {
      expect(pushState).toHaveBeenCalledTimes(1);
    });
  });

  it("restores filters from a popstate event", async () => {
    const pushState = vi.spyOn(window.history, "pushState");
    render(<App />);

    window.history.replaceState(null, "", "/?keyword=C%2B%2B&tier=A");
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() => {
      expect(screen.getByLabelText("关键词搜索")).toHaveValue("C++");
      expect(screen.getByLabelText("按梯队筛选")).toHaveValue("A");
    });
    expect(pushState).not.toHaveBeenCalled();
  });

  it("syncs job function filters to the existing URL state system", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "技术服务" }));

    await waitFor(() => {
      expect(window.location.search).toContain(
        "jobFunction=technical-service",
      );
    });
    expect(
      screen.getByRole("heading", { name: "FAE / 应用工程师" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "机器人算法实习生" }),
    ).not.toBeInTheDocument();
  });

  it("places role navigation before company radar and keeps candidates when filters reset", async () => {
    const user = userEvent.setup();
    render(<App />);
    const roleHeading = screen.getByRole("heading", { name: "职业方向导航" });
    const companyHeading = screen.getByRole("heading", { name: "公司雷达" });
    expect(
      roleHeading.compareDocumentPosition(companyHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "加入机器人产品经理候选" }),
    );
    await user.selectOptions(screen.getByLabelText("按梯队筛选"), "A");
    await user.click(screen.getByRole("button", { name: "重置所有筛选条件" }));
    expect(
      screen.getByRole("button", { name: "移出机器人产品经理候选" }),
    ).toBeInTheDocument();
    expect(window.location.search).toContain(
      "candidateRoles=robot-product-manager",
    );
  });

  it("caps the candidate list at five", async () => {
    const user = userEvent.setup();
    render(<App />);
    const roleNames = [
      "机器人控制算法工程师",
      "运动控制/强化学习运控实习生",
      "ROS/ROS2开发实习生",
      "仿真平台开发实习生",
      "机器人测试工程师",
    ];
    for (const name of roleNames) {
      await user.click(screen.getByRole("button", { name: `加入${name}候选` }));
    }
    expect(screen.getByRole("button", { name: "加入FAE / 应用工程师候选" })).toBeDisabled();
    expect(screen.getAllByRole("button", { name: /移出.*候选/ })).toHaveLength(5);
  });

  it("renders legal pages and an unknown path without a blank screen", () => {
    window.history.replaceState(null, "", "/privacy");
    const { rerender } = render(<App />);
    expect(screen.getByRole("heading", { name: "隐私政策" })).toBeInTheDocument();
    window.history.replaceState(null, "", "/missing");
    rerender(<App />);
    expect(screen.getByRole("heading", { name: "页面不存在" })).toBeInTheDocument();
  });
});
