"use client";

import React, { useState } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/common/Icons";
import { WeeklyProgressItem, ProgressSummary } from "@/data/mockData";

interface WeeklyProgressTimelineProps {
  timeline: WeeklyProgressItem[];
  progress: ProgressSummary;
  onSelectWeek?: (weekNumber: number) => void;
}

export function WeeklyProgressTimeline({
  timeline,
  progress,
  onSelectWeek,
}: WeeklyProgressTimelineProps) {
  const [filter, setFilter] = useState<"all" | "completed" | "current" | "upcoming">("all");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(progress.currentWeek);

  const filteredTimeline = timeline.filter((item) => {
    if (filter === "completed") return item.status === "Completed";
    if (filter === "current") return item.status === "Current";
    if (filter === "upcoming") return item.status === "Upcoming";
    return true;
  });

  const toggleWeek = (week: number) => {
    setExpandedWeek(expandedWeek === week ? null : week);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <TrendingUpIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Weekly Progress Summary & Milestones
            </h3>
            <p className="text-xs text-slate-500">
              Week-by-week timeline • {progress.currentWeek} of {progress.totalWeeks} Weeks Active
            </p>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "completed", "current", "upcoming"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                filter === mode
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 uppercase">Current Term</span>
          <div className="text-sm sm:text-base font-bold text-slate-900">
            Week {progress.currentWeek} <span className="text-xs text-slate-400 font-normal">/ {progress.totalWeeks}</span>
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-100">
          <span className="text-[11px] font-medium text-emerald-600 uppercase">Hours Completed</span>
          <div className="text-sm sm:text-base font-bold text-emerald-950">
            {progress.hoursCompleted} <span className="text-xs text-emerald-700 font-normal">/ {progress.targetHours} hrs</span>
          </div>
        </div>
        <div className="rounded-xl bg-indigo-50/70 p-3 border border-indigo-100">
          <span className="text-[11px] font-medium text-indigo-600 uppercase">Target Rate</span>
          <div className="text-sm sm:text-base font-bold text-indigo-950">
            {progress.weeklyTargetHours} hrs / week
          </div>
        </div>
        <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-100">
          <span className="text-[11px] font-medium text-amber-600 uppercase">Remaining Hours</span>
          <div className="text-sm sm:text-base font-bold text-amber-950">
            {progress.targetHours - progress.hoursCompleted} hrs
          </div>
        </div>
      </div>

      {/* Week-by-Week Cards Grid */}
      <div className="space-y-3 mt-2">
        {filteredTimeline.map((item) => {
          const isCurrent = item.status === "Current";
          const isCompleted = item.status === "Completed";
          const isExpanded = expandedWeek === item.week;

          return (
            <div
              key={item.week}
              className={`rounded-xl border transition-all ${
                isCurrent
                  ? "border-indigo-300 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs"
                  : isCompleted
                  ? "border-slate-200 bg-white hover:border-slate-300"
                  : "border-dashed border-slate-200 bg-slate-50/50 opacity-80"
              }`}
            >
              <div
                onClick={() => toggleWeek(item.week)}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3">
                  {/* Status Indicator Icon */}
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : isCurrent
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : `W${item.week}`}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">
                        Week {item.week}: {item.title}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
                          Current Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-0.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        {item.dateRange}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                        {item.hoursLogged > 0 ? `${item.hoursLogged} hrs logged` : "Pending log"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Badges & Toggle */}
                <div className="flex items-center justify-between sm:justify-end space-x-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : isCurrent
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {item.status}
                  </span>

                  <button
                    type="button"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 sm:mx-2 mt-1 text-xs text-slate-600">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800">Weekly Highlights: </span>
                      <span className="text-slate-600">{item.highlights}</span>
                    </div>
                    {onSelectWeek && isCurrent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectWeek(item.week);
                        }}
                        className="inline-flex items-center space-x-1 font-bold text-indigo-600 hover:text-indigo-800 shrink-0 self-start sm:self-auto"
                      >
                        <span>Submit Report</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
