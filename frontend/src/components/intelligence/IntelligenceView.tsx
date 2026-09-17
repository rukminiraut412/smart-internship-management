"use client";

import React from "react";
import {
  TargetIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  LightBulbIcon,
} from "@/components/common/Icons";
import { AttentionStatus, SkillMatchItem } from "@/data/mockData";

interface IntelligenceViewProps {
  attention: AttentionStatus;
  skills: SkillMatchItem[];
}

export function IntelligenceView({ attention, skills }: IntelligenceViewProps) {
  // 1. Progress Attention Metrics
  const statusKey = attention.status || "ON_TRACK";
  const isHealthy = statusKey === "ON_TRACK" || attention.health === "Healthy";
  const isMonitor = statusKey === "MONITOR";
  const score = attention.attentionScore ?? (100 - attention.riskScore);

  const displayStatus =
    statusKey === "NEEDS_ATTENTION"
      ? "NEEDS ATTENTION"
      : isMonitor
      ? "MONITOR"
      : "ON TRACK";

  const statusBadgeClass = isHealthy
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isMonitor
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-rose-50 text-rose-700 border-rose-200";

  const reasonsList =
    (attention.reasons && attention.reasons.length > 0)
      ? attention.reasons.slice(0, 3)
      : (attention.flaggedReasons && attention.flaggedReasons.length > 0)
      ? attention.flaggedReasons.slice(0, 3)
      : [
          "Weekly report submission velocity meets target expectations.",
          "Consistent task progress verified across sprints.",
          "Mentor evaluation confirms strong alignment with learning goals.",
        ];

  const primaryRecommendation =
    (attention.recommendations && attention.recommendations[0]) ||
    (attention.recommendedActions && attention.recommendedActions[0]) ||
    "Maintain steady weekly report submission cadence to ensure continuous academic monitoring.";

  // 2. Skill Gap Metrics
  const matchedSkills = skills.filter((s) => s.matchStatus === "Met");
  const missingSkills = skills.filter((s) => s.matchStatus !== "Met");
  const matchPct =
    skills.length > 0
      ? Math.round((matchedSkills.length / skills.length) * 100)
      : 80;

  const skillRecommendation =
    missingSkills.length > 0
      ? `Prioritize building practical proficiency in ${missingSkills
          .map((s) => s.skill)
          .join(", ")} to achieve 100% role competency.`
      : "All core competencies meet or exceed host company requirements. Ready for advanced capstone initiatives.";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TargetIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Internship Intelligence</h1>
            <p className="text-xs text-slate-500">
              Deterministic progress attention monitoring and explainable skill gap analysis.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-100 self-start sm:self-auto">
          <SparklesIcon className="w-4 h-4 text-indigo-500" />
          <span>Rule-Based Analytical Engine</span>
        </div>
      </div>

      {/* SECTION A: Progress Attention */}
      <section aria-label="Progress Attention Analysis" className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldExclamationIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Progress Attention</h2>
              <p className="text-xs text-slate-500">Early-intervention health score & factor evaluation</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${statusBadgeClass}`}>
              {isHealthy ? (
                <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              ) : (
                <AlertCircleIcon className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              )}
              {displayStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Score Display */}
          <div className="rounded-lg bg-slate-50/70 p-4 border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attention Score</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900">{score}</span>
                <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isHealthy ? "bg-indigo-600" : isMonitor ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, score)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {isHealthy ? "Strong engagement velocity" : "Attention threshold reached"}
              </p>
            </div>
          </div>

          {/* Explainable Reasons */}
          <div className="md:col-span-2 rounded-lg bg-slate-50/70 p-4 border border-slate-100 space-y-3">
            <span className="text-xs font-semibold text-slate-700 block">Explainable Evaluation Reasons</span>
            <ul className="space-y-2 text-xs">
              {reasonsList.map((reason, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-700">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-slate-200/60 mt-3">
              <div className="flex items-start space-x-2 text-xs">
                <LightBulbIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-slate-800">
                  <span className="font-semibold text-slate-900">Recommended Action: </span>
                  {primaryRecommendation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Skill Gap */}
      <section aria-label="Skill Gap Analysis" className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <TargetIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Skill Gap & Alignment</h2>
              <p className="text-xs text-slate-500">Student proficiency vs. role expectations</p>
            </div>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-lg font-bold text-purple-600">{matchPct}%</span>
            <span className="text-xs text-slate-400 font-medium"> Competency Match</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          {/* Matched Skills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Matched Skills ({matchedSkills.length})
              </span>
              <span className="text-slate-400 text-[11px]">Meets required level</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((s) => (
                  <span
                    key={s.skill}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200"
                  >
                    <span>{s.skill}</span>
                    <span className="text-[10px] text-emerald-600 font-normal">({s.studentLevel})</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills registered yet</span>
              )}
            </div>
          </div>

          {/* Missing / Developing Skills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-700 flex items-center gap-1">
                <AlertCircleIcon className="w-4 h-4 text-amber-500" />
                Missing / Target Skills ({missingSkills.length})
              </span>
              <span className="text-slate-400 text-[11px]">Recommended focus</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {missingSkills.length > 0 ? (
                missingSkills.map((s) => (
                  <span
                    key={s.skill}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200"
                  >
                    <span>{s.skill}</span>
                    <span className="text-[10px] text-amber-600 font-normal">
                      (Target: {s.requiredLevel})
                    </span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 font-medium">
                  Zero skill gaps identified for current role.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recommendation Footer */}
        <div className="mt-5 rounded-lg bg-slate-50/80 p-3.5 border border-slate-100 flex items-start space-x-2 text-xs">
          <LightBulbIcon className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-slate-700">
            <strong className="text-slate-900">Skill Development Recommendation: </strong>
            {skillRecommendation}
          </p>
        </div>
      </section>
    </div>
  );
}
