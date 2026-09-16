import React from "react";
import { TrendingUpIcon, ClockIcon } from "@/components/common/Icons";
import { ProgressSummary } from "@/data/mockData";

interface Props {
  progress: ProgressSummary;
}

export function ProgressCard({ progress }: Props) {
  const hoursPct = Math.min(100, Math.round((progress.hoursCompleted / progress.targetHours) * 100));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUpIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Internship Progress</h2>
            <p className="text-xs text-slate-500">Timeline & Hours</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
          Week {progress.currentWeek} of {progress.totalWeeks}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {/* Timeline Completion */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600">Term Timeline</span>
            <span className="text-indigo-600">{progress.percentComplete}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentComplete}%` }}
            ></div>
          </div>
        </div>

        {/* Hours Logged */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600 flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
              Logged Hours
            </span>
            <span className="text-slate-900 font-bold">
              {progress.hoursCompleted} <span className="text-slate-400 font-normal">/ {progress.targetHours} hrs</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${hoursPct}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-lg bg-slate-50 p-2 text-center border border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">Weekly Target</span>
            <div className="text-xs font-bold text-slate-800">{progress.weeklyTargetHours} hrs / wk</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-center border border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">Remaining</span>
            <div className="text-xs font-bold text-slate-800">{progress.targetHours - progress.hoursCompleted} hrs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
