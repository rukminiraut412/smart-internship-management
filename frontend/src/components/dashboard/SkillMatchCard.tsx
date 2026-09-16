import React from "react";
import { TargetIcon } from "@/components/common/Icons";
import { SkillMatchItem } from "@/data/mockData";

interface Props {
  skills: SkillMatchItem[];
}

export function SkillMatchCard({ skills }: Props) {
  const metCount = skills.filter((s) => s.matchStatus === "Met").length;
  const overallMatchPct = Math.round((metCount / skills.length) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <TargetIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Skill Match & Alignment</h2>
            <p className="text-xs text-slate-500">Role Competency Matrix</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-purple-600">{overallMatchPct}%</span>
          <span className="text-xs text-slate-400"> Match</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {skills.map((item) => (
          <div key={item.skill} className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-800">{item.skill}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({item.studentLevel} / Req: {item.requiredLevel})
                </span>
              </div>
              <span
                className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                  item.matchStatus === "Met"
                    ? "bg-purple-100 text-purple-800"
                    : item.matchStatus === "Partial"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {item.matchStatus}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  item.matchStatus === "Met" ? "bg-purple-600" : "bg-amber-500"
                }`}
                style={{ width: `${item.progressPct}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>2 skills recommended for upskilling</span>
        <span className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
          Detailed Gap Plan →
        </span>
      </div>
    </div>
  );
}
