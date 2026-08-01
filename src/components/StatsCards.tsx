import type { Company } from "../types";

interface StatsCardsProps {
  companies: Company[];
  roleCount: number;
  skillCount: number;
}

export function StatsCards({ companies, roleCount, skillCount }: StatsCardsProps) {
  const tierCounts = companies.reduce<Record<string, number>>((counts, company) => {
    counts[company.tier] = (counts[company.tier] ?? 0) + 1;
    return counts;
  }, {});
  const latestUpdate = companies
    .map((company) => company.lastUpdated)
    .sort()
    .at(-1);

  const cards = [
    { label: "公司数量", value: companies.length },
    { label: "岗位方向数量", value: roleCount },
    { label: "技能标签数量", value: skillCount },
    { label: "最近更新时间", value: latestUpdate ?? "待维护" },
    {
      label: "S/A/B/C 梯队数量",
      value: `S${tierCounts.S ?? 0} A${tierCounts.A ?? 0} B${tierCounts.B ?? 0} C${tierCounts.C ?? 0}`,
    },
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
      {cards.map((card) => (
        <div key={card.label} className="glass-panel rounded-xl p-4">
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
        </div>
      ))}
    </section>
  );
}
