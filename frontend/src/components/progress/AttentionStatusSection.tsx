"use client";

import React from "react";
import {
  ShieldExclamationIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  LightBulbIcon,
} from "@/components/common/Icons";
import { AttentionStatus, AttentionStatusLevel } from "@/data/mockData";

interface AttentionStatusSectionProps {
  attention: AttentionStatus;
  title?: string;
  className?: string;
}

export function AttentionStatusSection({
  attention,
  title = "Academic & Internship Attention Status",
  className = "",
}: AttentionStatusSectionProps) {
  // Normalize status to guarantee ON_TRACK | MONITOR | NEEDS_ATTENTION
  const rawStatus: string = attention.status || "ON_TRACK";
  let statusKey: AttentionStatusLevel = "ON_TRACK";
  if (rawStatus === "MONITOR") statusKey = "MONITOR";
  else if (rawStatus === "NEEDS_ATTENTION") statusKey = "NEEDS_ATTENTION";
  else statusKey = "ON_TRACK";

  const statusConfig = {
    ON_TRACK: {
      label: "ON_TRACK",
      displayTitle: "On Track • Strong Progress",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
      indicatorColor: "bg-emerald-500",
      accentBg: "from-emerald-50/40 via-white to-white",
      borderColor: "border-emerald-100",
      icon: CheckCircleIcon,
      scoreColor: "text-emerald-600",
      scoreBarBg: "bg-emerald-500",
    },
    MONITOR: {
      label: "MONITOR",
      displayTitle: "Monitor • Cadence Watch",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20",
      indicatorColor: "bg-amber-500",
      accentBg: "from-amber-50/40 via-white to-white",
      borderColor: "border-amber-100",
      icon: AlertCircleIcon,
      scoreColor: "text-amber-600",
      scoreBarBg: "bg-amber-500",
    },
    NEEDS_ATTENTION: {
      label: "NEEDS_ATTENTION",
      displayTitle: "Needs Attention • Action Required",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20",
      indicatorColor: "bg-rose-500",
      accentBg: "from-rose-50/40 via-white to-white",
      borderColor: "border-rose-100",
      icon: AlertCircleIcon,
      scoreColor: "text-rose-600",
      scoreBarBg: "bg-rose-500",
    },
  };

  const config = statusConfig[statusKey];
  const StatusIcon = config.icon;
  const reasonsList = attention.reasons || attention.flaggedReasons || [];
  const recommendationsList = attention.recommendations || attention.recommendedActions || [];
  const score = attention.attentionScore ?? (100 - attention.riskScore);

  return (
    <section
      aria-label="Student Internship Attention Status"
      className={`rounded-2xl border ${config.borderColor} bg-gradient-to-br ${config.accentBg} p-5 sm:p-6 shadow-xs ${className}`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <ShieldExclamationIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{title}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200">
                <SparklesIcon className="w-3 h-3 text-indigo-500" />
                Mock Intelligence Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Explainable Early-Intervention Health System • Evaluated: {attention.lastEvaluated}
            </p>
          </div>
        </div>

        {/* Status Badge & Score Counter */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Attention Score Metric */}
          <div className="text-right pr-3 border-r border-slate-200/80">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Attention Score
            </div>
            <div className="flex items-baseline space-x-1">
              <span className={`text-lg font-black tracking-tight ${config.scoreColor}`}>
                {score}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
          </div>

          {/* Core Status Pill: ON_TRACK / MONITOR / NEEDS_ATTENTION */}
          <div
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ring-1 shadow-2xs ${config.badgeClass}`}
          >
            <span className={`h-2 w-2 rounded-full ${config.indicatorColor} animate-pulse`} />
            <StatusIcon className="w-4 h-4" />
            <span>{config.label}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar for Score */}
      <div className="mt-3.5">
        <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 mb-1">
          <span>Health Index Rating</span>
          <span className="font-semibold text-slate-700">{score}% Stability</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.scoreBarBg}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      </div>

      {/* Reasons & Recommendations Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reasons Column */}
        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-2xs">
          <div className="flex items-center space-x-2 mb-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
              i
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Evaluated Reasons
            </h4>
          </div>
          <ul className="space-y-2">
            {reasonsList.map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-2 rounded-lg border border-slate-100"
              >
                <div className="mt-0.5 shrink-0">
                  {idx === reasonsList.length - 1 && statusKey !== "ON_TRACK" ? (
                    <AlertCircleIcon className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations Column */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-2xs">
          <div className="flex items-center space-x-2 mb-2.5">
            <LightBulbIcon className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
              Proactive Recommendations
            </h4>
          </div>
          <ul className="space-y-2">
            {recommendationsList.map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 text-xs text-indigo-900 leading-relaxed bg-white/90 p-2 rounded-lg border border-indigo-100/80"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white mt-0.5">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Info Notice */}
      <div className="mt-4 pt-3 border-t border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1.5">
        <span>Model Source: Rule-based explainability heuristics (Mock Intelligence Service)</span>
        <span className="text-indigo-600 font-medium">Automatic check-in scheduled every Friday 6:00 PM</span>
      </div>
    </section>
  );
}
