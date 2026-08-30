import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Company } from "../types";
import { Hero } from "./Hero";

const companies = [
  { id: "a", tier: "S", verificationStatus: "已公开核验", lastVerifiedAt: "2026-07-01", applicationEntries: [{ url: "https://example.com" }], roleDirections: [{ roleId: "rd-1" }] },
  { id: "b", tier: "A", verificationStatus: "待核验", lastVerifiedAt: "2026-07-10", applicationEntries: [], roleDirections: [] },
] as unknown as Company[];

const onClick = vi.fn();

describe("Hero", () => {
  it("renders a real data snapshot instead of decorative numbers", () => {
    render(<Hero companies={companies} onCompaniesClick={onClick} onRolesClick={onClick} />);

    // 快照数字必须来自 siteStats 的真实统计
    expect(screen.getByText("数据快照")).toBeInTheDocument();
    expect(screen.getByText("核验至 2026-07-10")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("已公开核验 1 家")).toBeInTheDocument();
    expect(screen.getByText("待核验 1 家")).toBeInTheDocument();
  });

  it("surfaces the site trust badges", () => {
    render(<Hero companies={companies} onCompaniesClick={onClick} onRolesClick={onClick} />);

    for (const badge of ["免费", "无需登录", "只放官方入口", "数据人工核验"]) {
      expect(screen.getByText(badge)).toBeInTheDocument();
    }
  });
});
