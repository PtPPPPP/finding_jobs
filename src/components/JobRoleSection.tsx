import { useMemo, useState } from "react";
import {
  jobFunctionLabels,
  jobFunctions,
  jobTrackLabels,
  jobTracks,
} from "../data/jobFunctions";
import type {
  Company,
  CompanyRoleFit,
  JobFunction,
  JobRole,
  JobRoleFilters,
  JobTrack,
} from "../types";
import {
  filterJobRoles,
  getRoleDisambiguation,
} from "../utils/filterJobRoles";

interface JobRoleSectionProps {
  roles: JobRole[];
  companies: Company[];
  fits: CompanyRoleFit[];
  activeSkill: string;
  filters: JobRoleFilters;
  candidateRoleIds: string[];
  onFiltersChange: (filters: JobRoleFilters, historyMode: "push" | "replace") => void;
  onCompanySelect: (companyId: string) => void;
  onToggleCandidate: (roleId: string) => void;
}

const scoreLabels = [
  ["技术深度", "technicalDepth"],
  ["沟通强度", "communicationIntensity"],
  ["出差强度", "travelIntensity"],
  ["项目协调", "coordinationIntensity"],
  ["应届生友好", "entryLevelFit"],
] as const;

const renderScore = (score: number) => `${"●".repeat(score)}${"○".repeat(5 - score)}`;

export function JobRoleSection({
  roles,
  companies,
  fits,
  activeSkill,
  filters,
  candidateRoleIds,
  onFiltersChange,
  onCompanySelect,
  onToggleCandidate,
}: JobRoleSectionProps) {
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const companyNameById = useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    [companies],
  );
  const roleTitleById = useMemo(
    () => new Map(roles.map((role) => [role.id, role.title])),
    [roles],
  );
  const visibleRoles = useMemo(
    () => filterJobRoles(roles, filters, activeSkill),
    [activeSkill, filters, roles],
  );
  const careerRoles = visibleRoles.filter((role) => role.roleKind !== "graduate-entry");
  const graduateEntries = visibleRoles.filter((role) => role.roleKind === "graduate-entry");
  const disambiguation = getRoleDisambiguation(filters.keyword);

  const updateFilter = <K extends keyof JobRoleFilters>(
    key: K,
    value: JobRoleFilters[K],
  ) => {
    onFiltersChange(
      { ...filters, [key]: value },
      key === "keyword" ? "replace" : "push",
    );
    setExpandedRoleId(null);
  };

  const resetFilters = () => {
    onFiltersChange({ keyword: "", functionType: "all", track: "all", roleId: "" }, "push");
    setExpandedRoleId(null);
  };

  return (
    <section id="roles" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">职业方向导航</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            正式职业方向与宽口径校招入口分开呈现；公司关联只表示业务匹配，不代表正在招聘。
          </p>
        </div>
        <span className="text-sm text-slate-400">
          当前显示 {visibleRoles.length} / {roles.length} 个方向
        </span>
      </div>

      <div className="glass-panel mb-5 space-y-4 rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
          <input
            aria-label="搜索职业方向"
            className="field"
            value={filters.keyword}
            onChange={(event) => updateFilter("keyword", event.target.value)}
            placeholder="搜索 FAE、PM、SE、NPI、技能或职责"
          />
          <select
            aria-label="选择具体职业方向"
            className="field"
            value={filters.roleId}
            onChange={(event) => updateFilter("roleId", event.target.value)}
          >
            <option value="">全部具体方向</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300"
          >
            重置职业筛选
          </button>
        </div>

        {disambiguation && (
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3" role="status">
            <p className="text-sm text-amber-100">{disambiguation.message}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {disambiguation.options.map((option) => (
                <button
                  key={option.roleId}
                  type="button"
                  onClick={() => onFiltersChange(
                    { ...filters, keyword: "", roleId: option.roleId },
                    "push",
                  )}
                  className="rounded-full border border-amber-200/30 px-3 py-2 text-xs text-amber-50"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <FilterButtons
          label="岗位轨道"
          allLabel="全部岗位"
          activeValue={filters.track}
          options={jobTracks}
          getLabel={(track) => jobTrackLabels[track]}
          onChange={(track) => updateFilter("track", track)}
        />

        <div>
          <label className="md:hidden">
            <span className="mb-2 block text-xs font-medium text-slate-400">职能分类</span>
            <select
              aria-label="职能分类"
              className="field"
              value={filters.functionType}
              onChange={(event) => updateFilter(
                "functionType",
                event.target.value as JobFunction | "all",
              )}
            >
              <option value="all">全部职能</option>
              {jobFunctions.map((jobFunction) => (
                <option key={jobFunction} value={jobFunction}>
                  {jobFunctionLabels[jobFunction]}
                </option>
              ))}
            </select>
          </label>
          <div className="hidden md:block">
            <FilterButtons
              label="职能分类"
              allLabel="全部职能"
              activeValue={filters.functionType}
              options={jobFunctions}
              getLabel={(jobFunction) => jobFunctionLabels[jobFunction]}
              onChange={(jobFunction) => updateFilter("functionType", jobFunction)}
            />
          </div>
        </div>
        {activeSkill && <p className="text-xs text-cyan-100">同时按技能「{activeSkill}」筛选岗位方向。</p>}
      </div>

      {careerRoles.length === 0 && graduateEntries.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {careerRoles.length > 0 && (
            <RoleGrid
              title="正式职业方向"
              roles={careerRoles}
              expandedRoleId={expandedRoleId}
              setExpandedRoleId={setExpandedRoleId}
              roleTitleById={roleTitleById}
              companyNameById={companyNameById}
              fits={fits}
              candidateRoleIds={candidateRoleIds}
              onToggleCandidate={onToggleCandidate}
              onCompanySelect={onCompanySelect}
            />
          )}
          {graduateEntries.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-2 text-xl font-semibold text-white">宽口径校招入口</h3>
              <p className="mb-4 text-sm text-slate-400">
                这两项是便于投递和探索的入口，不与职责边界清晰的正式方向做同级比较。
              </p>
              <RoleGrid
                title=""
                roles={graduateEntries}
                expandedRoleId={expandedRoleId}
                setExpandedRoleId={setExpandedRoleId}
                roleTitleById={roleTitleById}
                companyNameById={companyNameById}
                fits={fits}
                candidateRoleIds={candidateRoleIds}
                onToggleCandidate={onToggleCandidate}
                onCompanySelect={onCompanySelect}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}

interface RoleGridProps {
  title: string;
  roles: JobRole[];
  expandedRoleId: string | null;
  setExpandedRoleId: (id: string | null) => void;
  roleTitleById: Map<string, string>;
  companyNameById: Map<string, string>;
  fits: CompanyRoleFit[];
  candidateRoleIds: string[];
  onToggleCandidate: (roleId: string) => void;
  onCompanySelect: (companyId: string) => void;
}

function RoleGrid({
  title,
  roles,
  expandedRoleId,
  setExpandedRoleId,
  roleTitleById,
  companyNameById,
  fits,
  candidateRoleIds,
  onToggleCandidate,
  onCompanySelect,
}: RoleGridProps) {
  return (
    <div>
      {title && <h3 className="mb-4 text-xl font-semibold text-white">{title}</h3>}
      <div className="grid gap-4 lg:grid-cols-2">
        {roles.map((role) => {
          const expanded = expandedRoleId === role.id;
          const selected = candidateRoleIds.includes(role.id);
          const roleFits = fits.filter(({ roleId }) => roleId === role.id);
          return (
            <article key={role.id} className="glass-panel rounded-xl p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-lg font-semibold text-white">{role.title}</h4>
                <span className="chip bg-violet-300/10 text-violet-100">
                  {jobFunctionLabels[role.functionType]}
                </span>
                <span className="chip bg-cyan-300/5 text-cyan-100">
                  {jobTrackLabels[role.track]}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{role.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {role.requiredSkills.map((skill) => <span key={skill} className="chip">{skill}</span>)}
              </div>
              <p className="mt-4 text-sm text-slate-300">
                应届生友好度：
                <span className="ml-2 text-cyan-200" aria-label={`${role.entryLevelFit} 级，共 5 级`}>
                  {renderScore(role.entryLevelFit)}
                </span>
              </p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                {role.roleKind !== "graduate-entry" && (
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${selected ? "移出" : "加入"}${role.title}候选`}
                    disabled={!selected && candidateRoleIds.length >= 5}
                    onClick={() => onToggleCandidate(role.id)}
                    className="rounded-lg border border-cyan-300/30 px-3 py-2 text-xs text-cyan-100 disabled:opacity-40"
                  >
                    {selected ? "移出候选" : "加入候选"}
                  </button>
                )}
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`job-role-detail-${role.id}`}
                  aria-label={`${expanded ? "收起" : "展开"}${role.title}详情`}
                  onClick={() => setExpandedRoleId(expanded ? null : role.id)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200"
                >
                  {expanded ? "收起详情" : "查看岗位画像"}
                </button>
              </div>
              {expanded && (
                <RoleDetailGroups
                  role={role}
                  roleFits={roleFits}
                  roleTitleById={roleTitleById}
                  companyNameById={companyNameById}
                  onCompanySelect={onCompanySelect}
                />
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function RoleDetailGroups({
  role,
  roleFits,
  roleTitleById,
  companyNameById,
  onCompanySelect,
}: {
  role: JobRole;
  roleFits: CompanyRoleFit[];
  roleTitleById: Map<string, string>;
  companyNameById: Map<string, string>;
  onCompanySelect: (companyId: string) => void;
}) {
  const [openGroups, setOpenGroups] = useState(() => new Set(["work"]));
  const toggle = (group: string) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };
  const groups = [
    {
      id: "work",
      title: "做什么",
      content: (
        <>
          <RoleBlock title="主要职责" values={role.typicalResponsibilities} />
          {role.workflowStage && <RoleBlock title="工作阶段" values={[role.workflowStage]} />}
          {role.primaryDeliverables && <RoleBlock title="核心产出" values={role.primaryDeliverables} />}
          {role.accountability && <RoleBlock title="责任边界" values={[role.accountability]} />}
          <RoleBlock title="岗位画像" values={scoreLabels.map(([label, field]) => `${label}：${role[field]}/5`)} />
        </>
      ),
    },
    {
      id: "fit",
      title: "是否适合",
      content: (
        <>
          <RoleBlock title="常见标题" values={role.commonTitles} />
          <RoleBlock title="适合专业" values={role.suitableMajors} />
          <RoleBlock title="适合人群" values={role.suitableTraits} />
          {role.automationStudentFit && <RoleBlock title="自动化专业视角" values={role.automationStudentFit} />}
          <RoleBlock title="典型挑战" values={role.challenges} />
        </>
      ),
    },
    {
      id: "prepare",
      title: "如何准备",
      content: (
        <>
          <RoleBlock title="建议项目" values={role.resumeProjectIdeas} />
          <RoleBlock
            title="可从这些方向转入"
            values={role.transitionFrom.map((id) => roleTitleById.get(id) ?? id)}
          />
          <RoleBlock
            title="可继续探索"
            values={role.transitionTo.map((id) => roleTitleById.get(id) ?? id)}
          />
          <CompanyFitBlock
            fits={roleFits}
            companyNameById={companyNameById}
            onCompanySelect={onCompanySelect}
          />
        </>
      ),
    },
  ];

  return (
    <div id={`job-role-detail-${role.id}`} className="mt-5 border-t border-white/10 pt-3">
      {groups.map((group) => {
        const open = openGroups.has(group.id);
        const panelId = `${role.id}-${group.id}-panel`;
        return (
          <div key={group.id} className="border-b border-white/10 py-2">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(group.id)}
              className="flex w-full justify-between py-2 text-left text-sm font-semibold text-white"
            >
              {group.title}<span>{open ? "−" : "+"}</span>
            </button>
            {open && <div id={panelId} className="space-y-4 pb-3">{group.content}</div>}
          </div>
        );
      })}
    </div>
  );
}

function CompanyFitBlock({
  fits,
  companyNameById,
  onCompanySelect,
}: {
  fits: CompanyRoleFit[];
  companyNameById: Map<string, string>;
  onCompanySelect: (companyId: string) => void;
}) {
  const renderFits = (level: CompanyRoleFit["level"]) =>
    fits.filter((fit) => fit.level === level).map((fit) => (
      <button
        key={fit.companyId}
        type="button"
        aria-label={`查看相关公司${companyNameById.get(fit.companyId) ?? fit.companyId}`}
        title={fit.reason}
        onClick={() => onCompanySelect(fit.companyId)}
        className="chip bg-cyan-300/5 hover:border-cyan-300"
      >
        {companyNameById.get(fit.companyId) ?? fit.companyId}
      </button>
    ));
  const possible = fits.filter(({ level }) => level === "possible");
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-white">业务适配公司</p>
      <p className="text-xs text-slate-500">核心匹配</p>
      <div className="mt-1 flex flex-wrap gap-2">{renderFits("core")}</div>
      <p className="mt-3 text-xs text-slate-500">相邻匹配</p>
      <div className="mt-1 flex flex-wrap gap-2">{renderFits("adjacent")}</div>
      {possible.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-slate-400">
            查看 {possible.length} 个可能匹配
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">{renderFits("possible")}</div>
        </details>
      )}
      <p className="mt-2 text-xs text-slate-500">以上均为业务方向判断，不代表公司当前设岗或招聘。</p>
    </div>
  );
}

function RoleBlock({ title, values }: { title: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-white">{title}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
        {values.map((value) => <li key={value}>{value}</li>)}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-8 text-center text-slate-300">
      没有匹配的职业方向，请重置筛选或更换关键词。
    </div>
  );
}

interface FilterButtonsProps<T extends string> {
  label: string;
  allLabel: string;
  activeValue: T | "all";
  options: T[];
  getLabel: (value: T) => string;
  onChange: (value: T | "all") => void;
}

function FilterButtons<T extends string>({
  label,
  allLabel,
  activeValue,
  options,
  getLabel,
  onChange,
}: FilterButtonsProps<T>) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        <FilterButton active={activeValue === "all"} label={allLabel} onClick={() => onChange("all")} />
        {options.map((option) => (
          <FilterButton
            key={option}
            active={activeValue === option}
            label={getLabel(option)}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs ${
        active
          ? "border-cyan-200 bg-cyan-300 text-slate-950"
          : "border-white/10 text-slate-200 hover:border-cyan-300"
      }`}
    >
      {label}
    </button>
  );
}
