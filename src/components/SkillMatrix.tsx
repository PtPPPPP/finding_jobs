import { useEffect, useMemo, useState } from "react";
import { skillGroupLabels } from "../data/skills";
import type { SkillDefinition, SkillGroup } from "../types";

interface SkillMatrixProps {
  skills: SkillDefinition[];
  activeSkill: string;
  onSkillClick: (skill: string) => void;
}

const groupOrder = Object.keys(skillGroupLabels) as SkillGroup[];

export function SkillMatrix({ skills, activeSkill, onSkillClick }: SkillMatrixProps) {
  const activeGroup = skills.find(({ name }) => name === activeSkill)?.group;
  const [expandedGroup, setExpandedGroup] = useState<SkillGroup | null>(
    activeGroup ?? "software-engineering",
  );
  const [showSpecialized, setShowSpecialized] = useState(false);
  const skillsByGroup = useMemo(
    () =>
      new Map(
        groupOrder.map((group) => [
          group,
          skills.filter((skill) => skill.group === group),
        ]),
      ),
    [skills],
  );

  useEffect(() => {
    if (activeGroup) {
      setExpandedGroup(activeGroup);
      setShowSpecialized(true);
    }
  }, [activeGroup]);

  return (
    <section id="skills" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">技能地图</h2>
          <p className="mt-2 text-sm text-slate-400">
            59 项技能按能力域分组；低频专门技能默认收起，点击后只筛公司核心技能与相关岗位。
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <span className="text-slate-400">
            {activeSkill ? `已选技能：${activeSkill}` : "未选择技能"}
          </span>
          {activeSkill && (
            <button type="button" onClick={() => onSkillClick(activeSkill)} className="text-cyan-100">
              清除技能
            </button>
          )}
        </div>
      </div>
      <div className="glass-panel divide-y divide-white/10 rounded-2xl px-4">
        {groupOrder.map((group) => {
          const expanded = expandedGroup === group;
          const groupSkills = skillsByGroup.get(group) ?? [];
          const visibleSkills = groupSkills.filter(
            ({ name, priority }) =>
              priority !== "specialized" || showSpecialized || name === activeSkill,
          );
          const specializedCount = groupSkills.filter(
            ({ priority }) => priority === "specialized",
          ).length;
          const panelId = `skill-group-${group}`;

          return (
            <div key={group} className="py-3">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setExpandedGroup(expanded ? null : group)}
                className="flex w-full items-center justify-between py-2 text-left"
              >
                <span className="font-medium text-white">{skillGroupLabels[group]}</span>
                <span className="text-xs text-slate-400">
                  {groupSkills.length} 项 {expanded ? "−" : "+"}
                </span>
              </button>
              <div id={panelId} hidden={!expanded} className="pb-3">
                  <div className="flex flex-wrap gap-2">
                    {visibleSkills.map(({ name, priority }) => {
                      const active = activeSkill === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          aria-pressed={active}
                          onClick={() => onSkillClick(name)}
                          className={`rounded-full border px-3 py-2 text-sm transition ${
                            active
                              ? "border-cyan-200 bg-cyan-300 text-slate-950"
                              : priority === "primary"
                                ? "border-cyan-300/30 bg-cyan-300/5 text-cyan-50 hover:border-cyan-300"
                                : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300"
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                  {specializedCount > 0 && (
                    <button
                      type="button"
                      aria-expanded={showSpecialized}
                      onClick={() => setShowSpecialized((current) => !current)}
                      className="mt-3 text-xs text-slate-400 hover:text-white"
                    >
                      {showSpecialized ? "收起专门技能" : `展开 ${specializedCount} 项专门技能`}
                    </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
