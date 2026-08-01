import { SITE_VERSION } from "../config";
import { createFeedbackTemplate } from "../utils/feedback";
import { getSiteStats } from "../utils/siteStats";
import type { Company } from "../types";

export function FooterDisclaimer({ companies }: { companies: Company[] }) {
  const stats = getSiteStats(companies);
  const copyFeedback = async () => { await navigator.clipboard?.writeText(createFeedbackTemplate()); };
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-sm leading-7 text-slate-300">
        <p className="font-semibold text-white">免责声明</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>本站是求职导航，不保证岗位实时有效。</li>
          <li>具体招聘信息以公司官网、官方公众号和招聘平台为准。</li>
          <li>本站不绕过任何招聘平台的登录和反爬机制。</li>
          <li>“实时更新”以公开链接、搜索入口和人工维护数据为主。</li>
          <li>公司数据中标记“待核验”的内容需要人工进一步确认。</li>
          <li>职业方向不是实时职位，公司关联表示业务适配，不代表当前正在招聘。</li>
          <li>岗位画像和应届生友好度仅用于方向比较，不代表录用概率。</li>
          <li>本站会定期检查链接可访问性，但不保证对应岗位仍在招聘，请以公司官方页面为准。</li>
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
          <span>{SITE_VERSION}</span><span>数据最近核验：{stats.latestVerifiedAt}</span><span>公司：{stats.companyCount}</span><span>直接投递入口：{stats.companiesWithApplicationEntries}</span>
          <a href="/privacy" className="text-cyan-200">隐私政策</a><a href="/terms" className="text-cyan-200">服务条款</a>
          <button type="button" onClick={copyFeedback} className="text-cyan-200">复制反馈模板</button>
        </div>
      </div>
    </footer>
  );
}
