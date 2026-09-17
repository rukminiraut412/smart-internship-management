import React from "react";
import { TrendingUpIcon, ClockIcon } from "@/components/common/Icons";
import { ProgressSummary } from "@/data/mockData";

interface Props {
  progress: ProgressSummary;
  onNavigateToProgress?: () => void;
}

export function ProgressCard({
  progress,
  onNavigateToProgress,
}: Props) {
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(progress.percentComplete))
  );

  const hoursPct =
    progress.targetHours > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (progress.hoursCompleted / progress.targetHours) * 100
            )
          )
        )
      : 0;

  const remainingHours = Math.max(
    0,
    progress.targetHours - progress.hoursCompleted
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUpIcon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Progress
            </h2>
            <p className="text-xs text-slate-500">
              Internship completion
            </p>
          </div>
        </div>

        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
          Week {progress.currentWeek} / {progress.totalWeeks}
        </span>
      </div>

      {/* Main Progress */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Overall progress
          </span>

          <span className="text-lg font-bold text-slate-900">
            {progressPct}%
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Hours */}
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
            Hours logged
          </span>

          <span className="text-xs font-bold text-slate-800">
            {progress.hoursCompleted}
            <span className="font-normal text-slate-400">
              {" "}
              / {progress.targetHours} hrs
            </span>
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${hoursPct}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-100 bg-white p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Weekly target
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-800">
            {progress.weeklyTargetHours} hrs
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Remaining
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-800">
            {remainingHours} hrs
          </p>
        </div>
      </div>

      {/* Action */}
      {onNavigateToProgress && (
        <button
          type="button"
          onClick={onNavigateToProgress}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50"
        >
          View Progress & Reports →
        </button>
      )}
    </div>
  );
}
