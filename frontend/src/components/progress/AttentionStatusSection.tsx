"use client";

import React from "react";
import {
  ShieldExclamationIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LightBulbIcon,
} from "@/components/common/Icons";
import {
  AttentionStatus,
  AttentionStatusLevel,
} from "@/data/mockData";

interface AttentionStatusSectionProps {
  attention: AttentionStatus;
  title?: string;
  className?: string;
}

export function AttentionStatusSection({
  attention,
  title = "Progress Attention",
  className = "",
}: AttentionStatusSectionProps) {
  // Normalize status
  const rawStatus = attention.status || "ON_TRACK";

  let statusKey: AttentionStatusLevel = "ON_TRACK";

  if (rawStatus === "MONITOR") {
    statusKey = "MONITOR";
  } else if (rawStatus === "NEEDS_ATTENTION") {
    statusKey = "NEEDS_ATTENTION";
  }

  const statusConfig = {
    ON_TRACK: {
      label: "ON TRACK",
      description: "Progress is consistent",
      badgeClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      indicatorColor: "bg-emerald-500",
      borderColor: "border-emerald-100",
      icon: CheckCircleIcon,
      scoreColor: "text-emerald-600",
      scoreBarBg: "bg-emerald-500",
    },

    MONITOR: {
      label: "MONITOR",
      description: "Some progress signals need monitoring",
      badgeClass:
        "bg-amber-50 text-amber-700 border-amber-200",
      indicatorColor: "bg-amber-500",
      borderColor: "border-amber-100",
      icon: AlertCircleIcon,
      scoreColor: "text-amber-600",
      scoreBarBg: "bg-amber-500",
    },

    NEEDS_ATTENTION: {
      label: "NEEDS ATTENTION",
      description: "Progress requires action",
      badgeClass:
        "bg-rose-50 text-rose-700 border-rose-200",
      indicatorColor: "bg-rose-500",
      borderColor: "border-rose-100",
      icon: AlertCircleIcon,
      scoreColor: "text-rose-600",
      scoreBarBg: "bg-rose-500",
    },
  };

  const config = statusConfig[statusKey];
  const StatusIcon = config.icon;

  const reasonsList =
    attention.reasons || attention.flaggedReasons || [];

  const recommendationsList =
    attention.recommendations ||
    attention.recommendedActions ||
    [];

  const score = Math.min(
    100,
    Math.max(
      0,
      attention.attentionScore ??
        (100 - (attention.riskScore ?? 0))
    )
  );

  return (
    <section
      aria-label="Internship Progress Attention"
      className={`rounded-2xl border ${config.borderColor} bg-white p-5 sm:p-6 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 shrink-0">
            <ShieldExclamationIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {title}
              </h3>

              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                Explainable Analytics
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Progress-based analysis using internship activity signals.
            </p>
          </div>
        </div>

        {/* Status + Score */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right pr-3 border-r border-slate-200">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Attention Score
            </div>

            <div className="flex items-baseline gap-1">
              <span
                className={`text-lg font-black ${config.scoreColor}`}
              >
                {score}
              </span>

              <span className="text-xs text-slate-400">
                / 100
              </span>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${config.badgeClass}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${config.indicatorColor}`}
            />

            <StatusIcon className="w-4 h-4" />

            <span>{config.label}</span>
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 mb-1.5">
          <span>Progress Attention Level</span>

          <span className="font-semibold text-slate-700">
            {score}/100
          </span>
        </div>

        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.scoreBarBg}`}
            style={{
              width: `${score}%`,
            }}
          />
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {config.description}
        </p>
      </div>

      {/* Reasons + Recommendations */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reasons */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
              i
            </span>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Why this status?
            </h4>
          </div>

          {reasonsList.length > 0 ? (
            <ul className="space-y-2">
              {reasonsList.map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200"
                >
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />

                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              No specific attention reasons were recorded.
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <LightBulbIcon className="w-4 h-4 text-emerald-600" />

            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Recommended Action
            </h4>
          </div>

          {recommendationsList.length > 0 ? (
            <ul className="space-y-2">
              {recommendationsList.map((recommendation, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-emerald-900 leading-relaxed bg-white p-2.5 rounded-lg border border-emerald-100"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white mt-0.5">
                    {index + 1}
                  </span>

                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              No additional action is required at this time.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-400">
        <span>
          Rule-based explainable progress analysis
        </span>

        <span>
          Last evaluated: {attention.lastEvaluated || "Recently"}
        </span>
      </div>
    </section>
  );
}
