import React from "react";
import {
  ShieldExclamationIcon,
  CheckCircleIcon,
  SparklesIcon,
  AlertCircleIcon,
} from "@/components/common/Icons";
import { AttentionStatus } from "@/data/mockData";

interface Props {
  attention: AttentionStatus;
}

export function AttentionStatusCard({ attention }: Props) {
  const statusKey = attention.status || "ON_TRACK";

  const isOnTrack = statusKey === "ON_TRACK";
  const isMonitor = statusKey === "MONITOR";

  // Supports both backend intelligence data and existing mock-data structure.
  const score = Math.min(
    100,
    Math.max(
      0,
      attention.attentionScore ??
        (attention as AttentionStatus & { score?: number }).score ??
        100 - (attention.riskScore ?? 0)
    )
  );

  const reasons =
    attention.reasons?.length > 0
      ? attention.reasons
      : attention.flaggedReasons ?? [];

  const recommendations =
    attention.recommendations?.length > 0
      ? attention.recommendations
      : attention.recommendedActions ?? [];

  const displayStatus =
    statusKey === "NEEDS_ATTENTION"
      ? "NEEDS ATTENTION"
      : statusKey === "MONITOR"
        ? "MONITOR"
        : "ON TRACK";

  const statusBadgeClass = isOnTrack
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isMonitor
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  const scoreTextClass = isOnTrack
    ? "text-emerald-600"
    : isMonitor
      ? "text-amber-600"
      : "text-rose-600";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldExclamationIcon className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900">
                Progress Attention
              </h2>

              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                <SparklesIcon className="h-3 w-3" />
                Explainable Analytics
              </span>
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              Early intervention based on internship progress
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="shrink-0 text-right">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass}`}
          >
            {isOnTrack ? (
              <CheckCircleIcon className="mr-1 h-3.5 w-3.5" />
            ) : (
              <AlertCircleIcon className="mr-1 h-3.5 w-3.5" />
            )}

            {displayStatus}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Attention Score
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Based on recent internship activity
            </p>
          </div>

          <div className={`text-2xl font-bold ${scoreTextClass}`}>
            {Math.round(score)}
            <span className="text-xs font-medium text-slate-400">
              /100
            </span>
          </div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOnTrack
                ? "bg-emerald-500"
                : isMonitor
                  ? "bg-amber-500"
                  : "bg-rose-500"
            }`}
            style={{
              width: `${score}%`,
            }}
          />
        </div>
      </div>

      {/* Explainable Reasons */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Why this status?
          </span>

          <span className="text-[10px] font-medium text-slate-400">
            Explainable factors
          </span>
        </div>

        <div className="space-y-2">
          {reasons.length > 0 ? (
            reasons.slice(0, 3).map((reason, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-2.5"
              >
                {isOnTrack ? (
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                )}

                <span className="text-xs leading-relaxed text-slate-700">
                  {reason}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
              No attention factors are currently available.
            </div>
          )}
        </div>
      </div>

      {/* Recommended Actions */}
      {recommendations.length > 0 && (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-indigo-600" />

            <span className="text-xs font-bold text-indigo-900">
              Recommended Action
            </span>
          </div>

          <ul className="space-y-1.5">
            {recommendations.slice(0, 2).map((action, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs leading-relaxed text-indigo-800"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-500" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[10px] text-slate-400">
          Last evaluated: {attention.lastEvaluated || "Just now"}
        </span>

        <span className="text-[10px] font-medium text-slate-400">
          Progress-based analysis
        </span>
      </div>
    </div>
  );
}
