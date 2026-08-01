import type { Company } from "../types";
import { CompanyCard } from "./CompanyCard";

interface CompanyTableProps {
  companies: Company[];
  expandedCompanyId: string | null;
  onToggleCompany: (id: string) => void;
}

export function CompanyTable({
  companies,
  expandedCompanyId,
  onToggleCompany,
}: CompanyTableProps) {
  return (
    <div className="space-y-3">
      {companies.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-8 text-center text-slate-300">
          没有匹配公司，请重置筛选或换一个关键词。
        </div>
      ) : (
        companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            expanded={expandedCompanyId === company.id}
            onToggle={onToggleCompany}
          />
        ))
      )}
    </div>
  );
}
