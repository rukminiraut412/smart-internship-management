import React from "react";
import { TargetIcon } from "@/components/common/Icons";
import { SkillMatchItem } from "@/data/mockData";

interface Props {
  skills: SkillMatchItem[];
}

export function SkillMatchCard({ skills }: Props) {
  const totalSkills = skills.length;

  const metCount = skills.filter(
    (skill) => skill.matchStatus === "Met"
  ).length;

  const partialCount = skills.filter(
    (skill) => skill.matchStatus === "Partial"
  ).length;

  const gapCount = skills.filter(
    (skill) =>
      skill.matchStatus !== "Met" &&
      skill.matchStatus !== "Partial"
  ).length;

  /*
   * Match calculation:
   * Met     = 100%
   * Partial = 50%
   * Gap     = 0%
   */
  const overallMatchPct =
    totalSkills > 0
      ? Math.round(
          ((metCount * 100) + (partialCount * 50)) /
            totalSkills
        )
      : 0;

  const upskillingCount = partialCount + gapCount;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <TargetIcon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Skill Gap
            </h2>

            <p className="text-xs text-slate-500">
              Role skill alignment
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-purple-600">
            {overallMatchPct}%
          </p>

          <p className="text-[10px] font-medium text-slate-400">
            Overall match
          </p>
        </div>
      </div>

      {/* Skill Summary */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5 text-center">
          <p className="text-sm font-bold text-emerald-700">
            {metCount}
          </p>

          <p className="text-[10px] font-medium text-slate-500">
            Met
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-2.5 text-center">
          <p className="text-sm font-bold text-amber-700">
            {partialCount}
          </p>

          <p className="text-[10px] font-medium text-slate-500">
            Partial
          </p>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-2.5 text-center">
          <p className="text-sm font-bold text-rose-700">
            {gapCount}
          </p>

          <p className="text-[10px] font-medium text-slate-500">
            Gap
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-5 space-y-3">
        {skills.slice(0, 4).map((item) => {
          const statusClass =
            item.matchStatus === "Met"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : item.matchStatus === "Partial"
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-rose-50 text-rose-700 border-rose-100";

          const barClass =
            item.matchStatus === "Met"
              ? "bg-emerald-500"
              : item.matchStatus === "Partial"
              ? "bg-amber-500"
              : "bg-rose-500";

          return (
            <div
              key={item.skill}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-slate-800">
                    {item.skill}
                  </span>

                  <span className="text-[10px] text-slate-400">
                    {item.studentLevel} / Required {item.requiredLevel}
                  </span>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}
                >
                  {item.matchStatus}
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, item.progressPct)
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[11px] text-slate-500">
          {upskillingCount === 0
            ? "All required skills matched"
            : `${upskillingCount} skill${
                upskillingCount > 1 ? "s" : ""
              } need${upskillingCount === 1 ? "s" : ""} upskilling`}
        </span>

        <span className="text-[11px] font-semibold text-indigo-600">
          Skill Gap Analysis →
        </span>
      </div>
    </div>
  );
}
