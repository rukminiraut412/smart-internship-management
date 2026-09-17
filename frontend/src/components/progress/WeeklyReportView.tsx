"use client";

import React, { useState } from "react";
import {
  DocumentTextIcon,
  ClockIcon,
} from "@/components/common/Icons";
import {
  mockStudentData,
  WeeklyReport,
} from "@/data/mockData";
import { WeeklyReportForm } from "./WeeklyReportForm";
import { ReportHistoryList } from "./ReportHistoryList";

interface WeeklyReportViewProps {
  initialReports?: WeeklyReport[];
  initialWeek?: number;
  internshipId?: string;
  studentId?: string;
  onBackToProgress?: () => void;
  onReportSubmitted?: () => void;
}

export function WeeklyReportView({
  initialReports = mockStudentData.weeklyReports,
  initialWeek = 5,
  internshipId,
  studentId,
  onBackToProgress,
  onReportSubmitted,
}: WeeklyReportViewProps) {
  const [reports, setReports] =
    useState<WeeklyReport[]>(initialReports);

  const [prevInitialReports, setPrevInitialReports] =
    useState<WeeklyReport[]>(initialReports);

  const [activeSubTab, setActiveSubTab] =
    useState<"form" | "history">("form");

  // Keep local report state synced with updated backend/parent data
  if (initialReports !== prevInitialReports) {
    setPrevInitialReports(initialReports);
    setReports(initialReports);
  }

  const handleReportSubmitted = (
    newReport: WeeklyReport
  ) => {
    // Prepend newly submitted report to history
    setReports((currentReports) => [
      newReport,
      ...currentReports,
    ]);

    // Refresh parent/backend data
    if (onReportSubmitted) {
      onReportSubmitted();
    }

    // Show the newly submitted report in history
    setActiveSubTab("history");
  };

  const pendingCount = reports.filter(
    (report) =>
      report.status === "Pending Review" ||
      report.status === "Submitted"
  ).length;

  const reviewedCount = reports.filter(
    (report) => report.status === "Reviewed"
  ).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">

        <div className="flex items-center gap-3">

          {onBackToProgress && (
            <button
              type="button"
              onClick={onBackToProgress}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              ← Back to Progress
            </button>
          )}

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Weekly Reports
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Submit your weekly internship progress and track review status.
            </p>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">

          <button
            type="button"
            onClick={() => setActiveSubTab("form")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === "form"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <DocumentTextIcon className="w-3.5 h-3.5" />
            <span>Submit Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("history")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === "history"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            <span>
              History ({reports.length})
            </span>
          </button>

        </div>
      </div>

      {/* Compact Status Summary */}
      <div className="flex flex-wrap items-center gap-2">

        <div className="px-3 py-2 rounded-lg bg-white border border-slate-200">
          <span className="text-[11px] text-slate-500">
            Current Week
          </span>

          <span className="ml-1.5 text-xs font-bold text-slate-900">
            Week {initialWeek}
          </span>
        </div>

        <div className="px-3 py-2 rounded-lg bg-white border border-slate-200">
          <span className="text-[11px] text-slate-500">
            Total Reports
          </span>

          <span className="ml-1.5 text-xs font-bold text-slate-900">
            {reports.length}
          </span>
        </div>

        <div className="px-3 py-2 rounded-lg bg-white border border-slate-200">
          <span className="text-[11px] text-slate-500">
            Awaiting Review
          </span>

          <span className="ml-1.5 text-xs font-bold text-amber-600">
            {pendingCount}
          </span>
        </div>

        <div className="px-3 py-2 rounded-lg bg-white border border-slate-200">
          <span className="text-[11px] text-slate-500">
            Reviewed
          </span>

          <span className="ml-1.5 text-xs font-bold text-emerald-600">
            {reviewedCount}
          </span>
        </div>

      </div>

      {/* Main Content */}
      {activeSubTab === "form" ? (

        <div className="space-y-5">

          {/* Weekly Report Form */}
          <WeeklyReportForm
            initialWeek={initialWeek}
            internshipId={internshipId}
            studentId={studentId}
            onSubmitSuccess={handleReportSubmitted}
          />

          {/* Previous Reports */}
          <div>

            <div className="flex items-center justify-between mb-3">

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Report History
                </h3>

                <p className="text-xs text-slate-500 mt-0.5">
                  Previous weekly submissions and their review status.
                </p>
              </div>

              {reports.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveSubTab("history")
                  }
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View all →
                </button>
              )}

            </div>

            <ReportHistoryList
              reports={reports}
            />

          </div>
        </div>

      ) : (

        /* Full History */
        <div>

          <div className="mb-3">

            <h3 className="text-sm font-bold text-slate-900">
              All Weekly Reports
            </h3>

            <p className="text-xs text-slate-500 mt-0.5">
              Track submitted reports and review progress.
            </p>

          </div>

          <ReportHistoryList
            reports={reports}
          />

        </div>
      )}

    </div>
  );
}