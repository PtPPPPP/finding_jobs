import { useMemo, useState } from "react";
import { jobFunctionLabels } from "../data/jobFunctions";
import type { JobRole, QuickPickPreferences } from "../types";
import { defaultQuickPickPreferences } from "../utils/filterQuery";
import { getQuickPickResults } from "../utils/quickPick";

interface QuickPickProps {
  roles: JobRole[];
  preferences: QuickPickPreferences;
  candidateRoleIds: string[];
  onPreferencesChange: (preferences: QuickPickPreferences) => void;
  onToggleCandidate: (roleId: string) => void;
}

const questions: Array<{
  key: keyof QuickPickPreferences;
  label: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    key: "workType",
    label: "1. 更想解决哪类问题？",
    options: [
      { value: "unsure", label: "还不确定" },
      { value: "technology", label: "写代码、做算法或验证技术" },
      { value: "customer", label: "理解客户并解决现场问题" },
      { value: "product-project", label: "定义产品或推进项目" },
      { value: "manufacturing", label: "把产品稳定制造出来" },
      { value: "business", label: "市场、销售或商业合作" },
    ],
  },
  {
    key: "travel",
    label: "2. 能接受多少出差？",
    options: [
      { value: "any", label: "暂不限制" },
      { value: "low", label: "尽量少" },
      { value: "some", label: "偶尔可以" },
      { value: "high", label: "可以经常出差" },
    ],
  },
  {
    key: "workStyle",
    label: "3. 更喜欢怎样工作？",
    options: [
      { value: "unsure", label: "还不确定" },
      { value: "independent", label: "独立分析与深度工作" },
      { value: "coordination", label: "协调多人推进结果" },
      { value: "customer", label: "高频沟通客户" },
      { value: "field", label: "现场动手解决问题" },
    ],
  },
  {
    key: "technicalDepth",
    label: "4. 希望技术有多深？",
    options: [
      { value: "unsure", label: "还不确定" },
      { value: "deep", label: "希望长期深入技术" },
      { value: "balanced", label: "技术与沟通平衡" },
      { value: "business", label: "更偏业务与结果" },
    ],
  },
  {
    key: "entryPriority",
    label: "5. 如何看待入门门槛？",
    options: [
      { value: "easy", label: "优先容易入门" },
      { value: "medium", label: "门槛与发展平衡" },
      { value: "long-term", label: "愿意为长期发展多准备" },
    ],
  },
];

export function QuickPick({
  roles,
  preferences,
  candidateRoleIds,
  onPreferencesChange,
  onToggleCandidate,
}: QuickPickProps) {
  const initialGenerated = Object.entries(defaultQuickPickPreferences).some(
    ([key, value]) => preferences[key as keyof QuickPickPreferences] !== value,
  );
  const [generated, setGenerated] = useState(initialGenerated);
  const result = useMemo(
    () => getQuickPickResults(roles, preferences),
    [preferences, roles],
  );

  return (
    <section id="quick-pick" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-white">三分钟快速选岗</h2>
        <p className="mt-2 text-sm text-slate-400">
          回答 5 个偏好问题，得到 3～5 个可继续研究的正式职业方向。
        </p>
      </div>
      <div className="glass-panel rounded-2xl p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {questions.map((question) => (
            <label key={question.key} className="text-sm text-slate-200">
              <span className="mb-2 block min-h-10">{question.label}</span>
              <select
                className="field"
                value={preferences[question.key]}
                onChange={(event) => {
                  onPreferencesChange({
                    ...preferences,
                    [question.key]: event.target.value,
                  } as QuickPickPreferences);
                  setGenerated(false);
                }}
              >
                {question.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setGenerated(true)}
          className="mt-5 rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
        >
          生成方向建议
        </button>

        {generated && (
          <div className="mt-6" aria-live="polite">
            {result.relaxations.map((message) => (
              <p key={message} className="mb-3 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100">
                {message}
              </p>
            ))}
            <div className="grid gap-3 lg:grid-cols-2">
              {result.matches.map(({ role, reasons, challenge }) => {
                const selected = candidateRoleIds.includes(role.id);
                return (
                  <article key={role.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">{role.title}</h3>
                        <p className="mt-1 text-xs text-cyan-100">
                          {jobFunctionLabels[role.functionType]}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-pressed={selected}
                        aria-label={`${selected ? "移出" : "加入"}${role.title}候选`}
                        disabled={!selected && candidateRoleIds.length >= 5}
                        onClick={() => onToggleCandidate(role.id)}
                        className="rounded-lg border border-cyan-300/30 px-3 py-2 text-xs text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {selected ? "移出候选" : "加入候选"}
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      推荐理由：{reasons.join("；")}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      需要面对：{challenge}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
