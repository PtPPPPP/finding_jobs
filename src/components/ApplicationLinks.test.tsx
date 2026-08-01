import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ApplicationEntry } from "../types";
import { ApplicationLinks } from "./ApplicationLinks";

describe("ApplicationLinks", () => {
  it("renders a verified application entry with safe external-link attributes", () => {
    const entries: ApplicationEntry[] = [
      {
        label: "官方招聘",
        url: "https://example.com/careers",
        type: "career",
        verifiedAt: "2026-07-11",
      },
    ];

    render(<ApplicationLinks companyName="示例公司" entries={entries} />);

    const link = screen.getByRole("link", { name: "打开示例公司官方招聘页面" });
    expect(link).toHaveAttribute("href", "https://example.com/careers");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    expect(screen.getByText("核验于 2026-07-11")).toBeInTheDocument();
  });

  it("renders every application entry", () => {
    const entries: ApplicationEntry[] = [
      {
        label: "校园招聘",
        url: "https://example.com/campus",
        type: "campus",
      },
      {
        label: "社会招聘",
        url: "https://example.com/experienced",
        type: "experienced",
      },
    ];

    render(<ApplicationLinks companyName="示例公司" entries={entries} />);

    expect(screen.getByRole("link", { name: "打开示例公司校园招聘页面" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "打开示例公司社会招聘页面" })).toBeInTheDocument();
  });

  it.each([undefined, []])("renders an empty state without placeholder links", (entries) => {
    const { container } = render(
      <ApplicationLinks companyName="示例公司" entries={entries} />,
    );

    expect(screen.getByText("投递入口待核验")).toBeInTheDocument();
    expect(container.querySelector("a[href='']")).not.toBeInTheDocument();
    expect(container.querySelector("a[href='#']")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not render invalid external URLs", () => {
    render(
      <ApplicationLinks
        companyName="示例公司"
        entries={[{ label: "错误入口", url: "", type: "other" }]}
      />,
    );

    expect(screen.getByText("投递入口待核验")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
