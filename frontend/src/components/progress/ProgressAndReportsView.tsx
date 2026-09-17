"use client";

import React, { useState } from "react";
import {
  TrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@/components/common/Icons";
import {
  ProgressSummary,
  TaskItem,
  WeeklyReport,
  mockStudentData,
} from "@/data/mockData";
import { WeeklyReportForm } from "./WeeklyReportForm";
import { ReportHistoryList } from "./ReportHistoryList";

interface ProgressAndReportsViewProps {
  progress?: ProgressSummary;
  tasks?: TaskItem[];
  reports?: WeeklyReport[];
  internshipId?: string;
  studentId?: string;
  onReportSubmitted?: () => void;
}

export function ProgressAndReportsView({
  progress = mockStudentData.progress,
  tasks = mockStudentData.tasks,
  reports = mockStudentData.weeklyReports,
  internshipId,
  studentId,
  onReportSubmitted,
}: ProgressAndReportsViewProps) {
  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit");
  const [localSubmittedReports, setLocalSubmittedReports] = useState<WeeklyReport[]>([]);

  // Merge reports avoiding duplicates
  const detailedReports = [
    ...localSubmittedReports,
    ...reports.filter((r) => !localSubmittedReports.some((lr) => lr.id === r.id)),
  ];

  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const hoursPct = Math.min(
    100,
    Math.round((progress.hoursCompleted / progress.targetHours) * 100)
  );

  const handleLocalReportSubmitted = (newReport: WeeklyReport) => {
    setLocalSubmittedReports((prev) => [newReport, ...prev]);
    setActiveTab("history");
    if (onReportSubmitted) {
      onReportSubmitted();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUpIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Progress & Reports</h1>
            <p className="text-xs text-slate-500">
              Track academic milestones, work hours, and weekly progress submissions.
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 self-start sm:self-auto">
          Week {progress.currentWeek} of {progress.totalWeeks}
        </div>
      </div>

      {/* 1. Progress Overview Section */}
      <section aria-label="Progress Overview" className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h2 className="text-sm font-bold text-slate-900">Progress Overview</h2>
          <p className="text-xs text-slate-500">Cohort completion metrics and milestones</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Metric 1: Overall Progress */}
          <div className="rounded-lg bg-slate-50/70 p-4 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
              <span>Overall Progress</span>
              <span className="font-bold text-indigo-600">{progress.percentComplete}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Based on term duration and weekly milestones
            </p>
          </div>

          {/* Metric 2: Tasks Completed */}
          <div className="rounded-lg bg-slate-50/70 p-4 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Tasks Completed
              </span>
              <span className="font-bold text-slate-900">
                {completedTasksCount} / {tasks.length}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {tasks.length - completedTasksCount} deliverables pending
            </p>
          </div>

          {/* Metric 3: Logged Hours & Current Week */}
          <div className="rounded-lg bg-slate-50/70 p-4 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
              <span className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                Logged Hours
              </span>
              <span className="font-bold text-slate-900">
                {progress.hoursCompleted} <span className="text-slate-400 font-normal">/ {progress.targetHours}h</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${hoursPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Current Week: <strong>Week {progress.currentWeek}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 2. Weekly Reports Section */}
      <section aria-label="Weekly Reports" className="space-y-4">
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Weekly Reports</h2>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("submit")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === "submit"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Submit Report
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === "history"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Report History ({detailedReports.length})
            </button>
          </div>
        </div>

        {activeTab === "submit" && (
          <WeeklyReportForm
            initialWeek={progress.currentWeek}
            internshipId={internshipId}
            studentId={studentId}
            onSubmitSuccess={handleLocalReportSubmitted}
          />
        )}

        {activeTab === "history" && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <ReportHistoryList reports={detailedReports} />
          </div>
        )}
      </section>
    </div>
  );
}
