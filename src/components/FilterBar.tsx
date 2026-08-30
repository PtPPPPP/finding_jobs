import { useState } from "react";
import type { CompanyFilters, CompanySortKey, CompanyTier } from "../types";

interface FilterBarProps {
  filters: CompanyFilters;
  sortKey: CompanySortKey;
  cities: string[];
  categories: string[];
  roles: string[];
  skills: string[];
  resultCount: number;
  onFiltersChange: (
    filters: CompanyFilters,
    historyMode: "push" | "replace",
  ) => void;
  onSortChange: (sortKey: CompanySortKey) => void;
  onReset: () => void;
}

const tiers: Array<CompanyTier | "全部"> = ["全部", "S", "A", "B", "C"];

export function FilterBar({
  filters,
  sortKey,
  cities,
  categories,
  roles,
  skills,
  resultCount,
  onFiltersChange,
  onSortChange,
  onReset,
}: FilterBarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");

  const shareCurrentView = () => {
    // 筛选条件实时同步在 URL 里，直接分享当前链接即可复现同一视图
    if (!navigator.clipboard) {
      setShareState("failed");
      window.setTimeout(() => setShareState("idle"), 2000);
      return;
    }
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setShareState("copied");
        window.setTimeout(() => setShareState("idle"), 2000);
      })
      .catch(() => {
        setShareState("failed");
        window.setTimeout(() => setShareState("idle"), 2000);
      });
  };

  const activeFilterCount = [
    filters.tier !== "全部",
    filters.city !== "全部",
    Boolean(filters.category),
    Boolean(filters.role),
    Boolean(filters.skill),
    sortKey !== "fitScore",
  ].filter(Boolean).length;
  const filterSummary = [
    filters.keyword.trim(),
    filters.tier !== "全部" ? filters.tier : "",
    filters.city !== "全部" ? filters.city : "",
    filters.category,
    filters.role,
    filters.skill,
  ].filter(Boolean).join(" · ");
  const update = <K extends keyof CompanyFilters>(key: K, value: CompanyFilters[K]) => {
    onFiltersChange(
      { ...filters, [key]: value },
      key === "keyword" ? "replace" : "push",
    );
  };

  return (
    <section className="glass-panel rounded-2xl p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">公司雷达</h2>
          <p className="mt-1 text-sm text-slate-400">当前命中 {resultCount} 家公司</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={shareCurrentView}
            aria-label="复制当前筛选视图的链接"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
          >
            {shareState === "copied" ? "已复制链接" : shareState === "failed" ? "复制失败" : "分享当前筛选"}
          </button>
          <button
            type="button"
            aria-label="重置所有筛选条件"
            onClick={() => {
              setMobileFiltersOpen(false);
              onReset();
            }}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
          >
            重置筛选
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="sr-only" htmlFor="company-keyword">
          关键词搜索
        </label>
        <input
          id="company-keyword"
          className="field xl:col-span-2"
          value={filters.keyword}
          onChange={(event) => update("keyword", event.target.value)}
          placeholder="搜索公司、方向、技能"
        />
        <label className="sr-only" htmlFor="company-city">
          城市
        </label>
        <select
          id="company-city"
          className="field"
          value={filters.city}
          onChange={(event) => update("city", event.target.value)}
          aria-label="按城市筛选公司"
        >
          {["全部", ...cities].map((city) => (
            <option key={city} value={city}>
              {city === "全部" ? "全部城市" : city}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-expanded={mobileFiltersOpen}
          aria-controls="company-advanced-filters"
          onClick={() => setMobileFiltersOpen((current) => !current)}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 md:hidden"
        >
          {mobileFiltersOpen ? "收起筛选" : `更多筛选${activeFilterCount ? `（${activeFilterCount}）` : ""}`}
        </button>
      </div>

      {activeFilterCount > 0 && (
        <p className="mt-3 text-xs text-cyan-100 md:hidden" aria-live="polite">
          <span>已启用 {activeFilterCount} 个筛选条件</span>
          <span className="ml-2">· 已选：{filterSummary || "无"}</span>
        </p>
      )}

      <div
        id="company-advanced-filters"
        className={`${mobileFiltersOpen ? "grid" : "hidden"} mt-3 gap-3 md:grid md:grid-cols-2 xl:grid-cols-5`}
      >
        <label className="sr-only" htmlFor="company-tier">
          按梯队筛选
        </label>
        <select
          id="company-tier"
          aria-label="按梯队筛选"
          className="field"
          value={filters.tier}
          onChange={(event) => update("tier", event.target.value as CompanyTier | "全部")}
        >
          {tiers.map((tier) => (
            <option key={tier}>{tier}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="company-category">
          按公司类型筛选
        </label>
        <select
          id="company-category"
          aria-label="按公司类型筛选"
          className="field"
          value={filters.category}
          onChange={(event) => update("category", event.target.value)}
        >
          <option value="">全部公司类型</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="company-role">
          按岗位方向筛选
        </label>
        <select
          id="company-role"
          aria-label="按岗位方向筛选"
          className="field"
          value={filters.role}
          onChange={(event) => update("role", event.target.value)}
        >
          <option value="">全部岗位方向</option>
          {roles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="company-skill">
          按技能筛选
        </label>
        <select
          id="company-skill"
          aria-label="按技能筛选"
          className="field"
          value={filters.skill}
          onChange={(event) => update("skill", event.target.value)}
        >
          <option value="">全部技能</option>
          {skills.map((skill) => (
            <option key={skill}>{skill}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="company-sort">
          排序方式
        </label>
        <select
          id="company-sort"
          aria-label="排序方式"
          className="field md:col-span-2 xl:col-span-1"
          value={sortKey}
          onChange={(event) => onSortChange(event.target.value as CompanySortKey)}
        >
          <option value="fitScore">按适配度排序</option>
          <option value="undergraduateFriendlyScore">按本科生友好度排序</option>
          <option value="tier">按公司梯队排序</option>
        </select>
      </div>
    </section>
  );
}
