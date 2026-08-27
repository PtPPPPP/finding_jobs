interface LegalPageProps { page: "privacy" | "terms"; }

export function LegalPage({ page }: LegalPageProps) {
  const privacy = page === "privacy";
  return <main className="mx-auto min-h-screen max-w-3xl px-4 py-16 text-slate-300 sm:px-6">
    <a href={import.meta.env.BASE_URL} className="text-cyan-200 hover:text-cyan-100">返回首页</a>
    <article className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-6 leading-7">
      <h1 className="text-2xl font-semibold text-white">{privacy ? "隐私政策" : "服务条款"}</h1>
      {privacy ? <><p>本网站当前不提供账号注册、简历上传或保存，不主动收集搜索关键词、Cookie 或分析统计数据。</p><p>点击外部招聘链接后，相关网站由第三方运营；其隐私规则以对方页面为准。反馈模板仅在你的浏览器中生成，是否发送及发送给谁由你自行决定。</p></> : <><p>本网站提供求职信息导航，不构成录用承诺。招聘信息、岗位开放状态和用人主体以公司官方页面为准，数据可能存在延迟或错误。</p><p>禁止以自动化攻击、非法抓取或其他违法方式使用本站。本文为基础信息说明，不构成法律意见。</p></>}
    </article>
  </main>;
}
