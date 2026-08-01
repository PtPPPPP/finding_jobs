import { jobFunctionLabels, jobTrackLabels } from "../data/jobFunctions";
import type { Company, CompanyRoleFit, JobRole } from "../types";

interface CandidateComparisonProps {
  roles: JobRole[];
  companies: Company[];
  fits: CompanyRoleFit[];
  candidateRoleIds: string[];
  onRemove: (roleId: string) => void;
  onClear: () => void;
}

const renderScore = (score: number) => `${score}/5`;

export function CandidateComparison({
  roles,
  companies,
  fits,
  candidateRoleIds,
  onRemove,
  onClear,
}: CandidateComparisonProps) {
  const candidates = candidateRoleIds.flatMap((id) => {
    const role = roles.find((item) => item.id === id);
    return role ? [role] : [];
  });
  const companyNameById = new Map(companies.map(({ id, name }) => [id, name]));

  return (
    <section id="candidate-compare" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">候选方向对比</h2>
          <p className="mt-2 text-sm text-slate-400">选择 2～5 个正式方向后，对照工作阶段、产出和画像做取舍。</p>
        </div>
        {candidates.length > 0 && (
          <button type="button" onClick={onClear} className="text-sm text-slate-300 hover:text-white">
            清空候选
          </button>
        )}
      </div>

      {candidates.length < 2 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-slate-400">
          已选 {candidates.length} 个方向。再加入 {2 - candidates.length} 个即可开始对比，最多 5 个。
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {candidates.map((role) => {
            const coreCompanies = fits
              .filter(({ roleId, level }) => roleId === role.id && level === "core")
              .map(({ companyId }) => companyNameById.get(companyId) ?? companyId);
            return (
              <article key={role.id} className="glass-panel rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{role.title}</h3>
                  <button
                    type="button"
                    aria-label={`移除${role.title}`}
                    onClick={() => onRemove(role.id)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    移除
                  </button>
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <CompareRow label="职能" value={jobFunctionLabels[role.functionType]} />
                  <CompareRow label="轨道" value={jobTrackLabels[role.track]} />
                  <CompareRow label="工作阶段" value={role.workflowStage ?? role.description} />
                  <CompareRow label="核心产出" value={(role.primaryDeliverables ?? role.resumeProjectIdeas).slice(0, 3).join("、")} />
                  <CompareRow label="推荐项目" value={role.resumeProjectIdeas.slice(0, 2).join("、")} />
                  <CompareRow label="责任边界" value={role.accountability ?? role.description} />
                  <CompareRow label="技术深度" value={renderScore(role.technicalDepth)} />
                  <CompareRow label="沟通强度" value={renderScore(role.communicationIntensity)} />
                  <CompareRow label="出差强度" value={renderScore(role.travelIntensity)} />
                  <CompareRow label="项目协调" value={renderScore(role.coordinationIntensity)} />
                  <CompareRow label="应届生友好" value={renderScore(role.entryLevelFit)} />
                  <CompareRow label="核心技能" value={role.requiredSkills.join("、")} />
                  <CompareRow label="典型挑战" value={role.challenges.join("；")} />
                  <CompareRow label="核心关联公司" value={coreCompanies.join("、") || "暂无核心关联"} />
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 leading-6 text-slate-200">{value}</dd>
    </div>
  );
}
