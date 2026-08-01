interface HeroProps {
  onCompaniesClick: () => void;
  onRolesClick: () => void;
}

export function Hero({ onCompaniesClick, onRolesClick }: HeroProps) {
  return (
    <section className="mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col justify-center px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            北京具身智能公司与岗位雷达
          </h1>
          <p className="mt-5 text-xl text-cyan-100">
            面向自动化、机器人与 AI 学生的多职能求职导航
          </p>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            覆盖研发算法、产品方案、技术服务、项目交付、测试质量、智能制造、供应链和技术市场等职业方向。
          </p>
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

        <div className="glass-panel rounded-2xl p-5">
          <div className="rounded-xl border border-cyan-300/20 bg-slate-950/70 p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm text-slate-400">Radar Snapshot</span>
              <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs text-emerald-200">
                public data first
              </span>
            </div>
            <div className="space-y-4">
              {["公司分层", "岗位方向", "技能匹配", "投递入口"].map((item, index) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-300/15 text-sm font-semibold text-cyan-200">
                    {index + 1}
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                      style={{ width: `${88 - index * 12}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
