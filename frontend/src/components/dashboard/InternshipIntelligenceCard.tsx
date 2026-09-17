import React from "react";
import { TargetIcon } from "@/components/common/Icons";
import { AttentionStatus, SkillMatchItem } from "@/data/mockData";

interface Props {
  attention: AttentionStatus;
  skills: SkillMatchItem[];
  onNavigateToIntelligence?: () => void;
}

export function InternshipIntelligenceCard({
  attention,
  skills,
  onNavigateToIntelligence,
}: Props) {
  const statusKey = attention.status || "ON_TRACK";
  const isHealthy = statusKey === "ON_TRACK" || attention.health === "Healthy";
  const isMonitor = statusKey === "MONITOR";
  const score = attention.attentionScore ?? (100 - attention.riskScore);

  const metCount = skills.filter((s) => s.matchStatus === "Met").length;
  const matchPct = skills.length > 0 ? Math.round((metCount / skills.length) * 100) : 85;

  const displayStatus =
    statusKey === "NEEDS_ATTENTION"
      ? "Action Needed"
      : isMonitor
      ? "Monitor"
      : "On Track";

  const statusBadgeClass = isHealthy
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isMonitor
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div
      onClick={onNavigateToIntelligence}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all ${
        onNavigateToIntelligence ? "cursor-pointer hover:border-indigo-300" : ""
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <TargetIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Internship Intelligence</h2>
            <p className="text-xs text-slate-500">Early Health & Skills</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusBadgeClass}`}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
              isHealthy ? "bg-emerald-500" : isMonitor ? "bg-amber-500" : "bg-rose-500"
            }`}
          />
          {displayStatus}
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {/* Metric 1: Attention Score */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Attention Score</span>
            <span className="text-indigo-600 font-bold">{score} / 100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isHealthy ? "bg-indigo-600" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, score)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Skill Match */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Skill Competency Match</span>
            <span className="text-emerald-600 font-bold">{matchPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${matchPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
