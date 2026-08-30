import type { Company, CompanyTier, VerificationStatus } from "../types";
import { getSiteStats } from "../utils/siteStats";

interface HeroProps {
  companies: Company[];
  onCompaniesClick: () => void;
  onRolesClick: () => void;
}

const TIERS: CompanyTier[] = ["S", "A", "B", "C"];

const TIER_LABELS: Record<CompanyTier, string> = {
  S: "S 梯队",
  A: "A 梯队",
  B: "B 梯队",
  C: "C 梯队",
};

const VERIFICATION_DOT_STYLES: Record<VerificationStatus, string> = {
  已公开核验: "bg-emerald-300",
  部分核验: "bg-amber-300",
  待核验: "bg-slate-500",
};

const TRUST_BADGES = ["免费", "无需登录", "只放官方入口", "数据人工核验"];

export function Hero({ companies, onCompaniesClick, onRolesClick }: HeroProps) {
  const stats = getSiteStats(companies);
  const highlights = [
    { label: "公司", value: stats.companyCount },
    { label: "岗位方向", value: stats.roleDirectionCount },
    { label: "官方投递入口", value: stats.applicationEntryCount },
  ];

  return (
    <section className="mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col justify-center px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            具身智能公司与岗位雷达
          </h1>
          <p className="mt-5 text-xl text-cyan-100">
            覆盖北京 · 上海 · 深圳 · 杭州 · 苏州等城市，面向自动化、机器人与 AI 学生
          </p>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            覆盖研发算法、产品方案、技术服务、项目交付、测试质量、智能制造、供应链和技术市场等职业方向。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100"
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCompaniesClick}
              className="rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              查看公司雷达
            </button>
            <button
              type="button"
              onClick={onRolesClick}
              className="rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-violet-300 hover:bg-violet-400/20"
            >
              查看岗位方向
            </button>
          </div>
        </div>

        {/* 快照数字全部来自数据文件实时统计，与页面展示的公司一一对应 */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="rounded-xl border border-cyan-300/20 bg-slate-950/70 p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm text-slate-400">数据快照</span>
              <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs text-emerald-200">
                核验至 {stats.latestVerifiedAt}
              </span>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/5 bg-slate-900/60 p-3 text-center">
                  <div className="text-2xl font-semibold text-cyan-200">{item.value}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {TIERS.map((tier) => {
                const count = stats.tierCounts[tier];
                const share = stats.companyCount > 0 ? (count / stats.companyCount) * 100 : 0;
                return (
                  <div key={tier} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-xs text-slate-400">{TIER_LABELS[tier]}</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                        style={{ width: `${Math.max(share, count > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm text-slate-300">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/5 pt-4">
              {(Object.keys(stats.verificationCounts) as VerificationStatus[]).map((status) => (
                <span key={status} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className={`size-2 rounded-full ${VERIFICATION_DOT_STYLES[status]}`} />
                  {status} {stats.verificationCounts[status]} 家
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
