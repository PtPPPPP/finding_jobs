import type { Company, CompanyTier } from "../types";
import { ApplicationLinks } from "./ApplicationLinks";
import { createFeedbackTemplate } from "../utils/feedback";
import { renderScoreDots } from "../utils/score";
import { freshnessLabel, getVerificationFreshness } from "../utils/verificationFreshness";

interface CompanyCardProps {
  company: Company;
  expanded: boolean;
  onToggle: (id: string) => void;
}

const tierClass: Record<CompanyTier, string> = {
  S: "border-cyan-300/50 bg-cyan-300/15 text-cyan-100",
  A: "border-violet-300/50 bg-violet-300/15 text-violet-100",
  B: "border-blue-300/50 bg-blue-300/15 text-blue-100",
  C: "border-slate-300/40 bg-slate-300/10 text-slate-200",
};

function ExternalLink({
  href,
  label,
  companyName,
}: {
  href?: string;
  label: string;
  companyName: string;
}) {
  if (!href) {
    return <span className="text-xs text-slate-500">{label}待核验</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`打开${companyName}${label}页面`}
      className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-300/10"
    >
      {label}
    </a>
  );
}

export function CompanyCard({ company, expanded, onToggle }: CompanyCardProps) {
  const detailId = `company-detail-${company.id}`;
  const coreDirections = (company.roleDirections ?? []).filter(({ level }) => level === "core");
  const adjacentDirections = (company.roleDirections ?? []).filter(({ level }) => level === "adjacent");
  const possibleDirections = (company.roleDirections ?? []).filter(({ level }) => level === "possible");
  const copyFeedback = () => {
    if (!navigator.clipboard) {
      window.alert("当前环境不支持剪贴板复制，请手动复制模板内容。");
      return;
    }
    navigator.clipboard.writeText(createFeedbackTemplate(company)).catch(() => {
      window.alert("复制失败，请检查浏览器剪贴板权限（需 HTTPS 环境）。");
    });
  };

  return (
    <article className="rounded-xl border border-white/10 bg-slate-950/55 p-4 transition hover:border-cyan-300/40">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{company.name}</h3>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${tierClass[company.tier]}`}>
              {company.tier} 梯队
            </span>
            <span className="chip">{company.verificationStatus}</span>
            <span className="chip">{freshnessLabel[getVerificationFreshness(company.lastVerifiedAt)]}</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{company.englishName || "英文名待核验"}</p>
        </div>
        <div className="text-sm text-slate-300">
          <div>适配度 <span className="text-cyan-200">{renderScoreDots(company.fitScore)}</span></div>
          <div>本科友好 <span className="text-violet-200">{renderScoreDots(company.undergraduateFriendlyScore)}</span></div>
        </div>
      </header>
      <p className="mt-2 text-xs text-slate-400">最近核验：{company.lastVerifiedAt ?? "待核验"}</p>

      <div className="mt-3 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
        <div>
          <p className="text-xs text-slate-500">公司类型</p>
          <p>{company.category.join(" / ")}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">北京相关性</p>
          <p>
            {company.cities
              .map(({ city, presence }) => (presence === "待核验" ? `${city}（待核验）` : `${city} · ${presence}`))
              .join("，")}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">更新时间</p>
          <p>{company.lastUpdated}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {company.focus.slice(0, 5).map((focus) => (
          <span key={focus} className="chip bg-cyan-300/5">
            {focus}
          </span>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailId}
          aria-label={`${expanded ? "收起" : "展开"}${company.name}详情`}
          onClick={() => onToggle(company.id)}
          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
        >
          {expanded ? "收起详情" : "查看详情"}
        </button>
      </div>

      {expanded && (
        <section id={detailId} className="mt-5 border-t border-white/10 pt-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <DetailBlock title="推荐投递理由" content={company.reason} />
            <DetailBlock title="风险与注意点" content={company.risks || "暂无更多风险说明。"} />
            <div>
              <p className="mb-2 text-sm font-semibold text-white">职业方向关联（不代表当前在招）</p>
              <DirectionBlock title="核心方向" directions={coreDirections} />
              <DirectionBlock title="相邻方向" directions={adjacentDirections} />
              {possibleDirections.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-slate-400">
                    查看 {possibleDirections.length} 个可能方向
                  </summary>
                  <DirectionBlock title="" directions={possibleDirections} />
                </details>
              )}
            </div>
            <ListBlock title="公司核心技能" values={company.recommendedSkills} />
            <RoleSkillBlock company={company} />
            <DetailBlock title="适合做的简历项目" content={company.projectSuggestion || "建议补充一个可演示、可复盘的机器人项目。"} />
            <div>
              <p className="mb-2 text-sm font-semibold text-white">投递入口</p>
              <ApplicationLinks
                companyName={company.name}
                entries={company.applicationEntries}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-white">反馈</p>
              <button type="button" onClick={copyFeedback} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-cyan-300 hover:text-cyan-100">复制“报告信息有误”模板</button>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-white">公开信息</p>
              <div className="flex flex-wrap gap-2">
                <ExternalLink href={company.websiteUrl} label="官网" companyName={company.name} />
                <ExternalLink href={company.searchUrl} label="实时搜索" companyName={company.name} />
              </div>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

function RoleSkillBlock({ company }: { company: Company }) {
  const grouped = company.relatedRoleSkillsByLevel;
  if (!grouped) {
    return <ListBlock title="相关岗位可能涉及" values={company.relatedRoleSkills ?? []} />;
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-white">相关岗位可能涉及</p>
      <div className="space-y-3">
        <ListBlock title="核心关联岗位技能" values={grouped.core} />
        <ListBlock title="相邻关联岗位技能" values={grouped.adjacent} />
        {grouped.possible.length > 0 && (
          <details>
            <summary className="cursor-pointer text-xs text-slate-400">
              查看 {grouped.possible.length} 项可能关联技能
            </summary>
            <div className="mt-2">
              <ListBlock title="可能关联岗位技能" values={grouped.possible} />
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function DirectionBlock({
  title,
  directions,
}: {
  title: string;
  directions: NonNullable<Company["roleDirections"]>;
}) {
  if (directions.length === 0) return null;
  return (
    <div className="mt-2">
      {title && <p className="text-xs text-slate-500">{title}</p>}
      <ul className="mt-1 space-y-2 text-sm text-slate-300">
        {directions.map((direction) => (
          <li key={direction.roleId}>
            <span className="text-slate-100">{direction.title}</span>
            <span className="ml-2 text-xs text-slate-500">{direction.reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailBlock({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-white">{title}</p>
      <p className="text-sm leading-6 text-slate-300">{content}</p>
    </div>
  );
}

function ListBlock({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-white">{title}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className="chip">
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
