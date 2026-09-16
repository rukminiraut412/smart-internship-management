"use client";

import React, { useState } from "react";
import {
  DocumentTextIcon,
  ClockIcon,
} from "@/components/common/Icons";
import {
  mockStudentData,
  WeeklyReport,
  AttentionStatus,
} from "@/data/mockData";
import { WeeklyReportForm } from "./WeeklyReportForm";
import { ReportHistoryList } from "./ReportHistoryList";
import { AttentionStatusSection } from "./AttentionStatusSection";

interface WeeklyReportViewProps {
  attention?: AttentionStatus;
  initialReports?: WeeklyReport[];
  initialWeek?: number;
  internshipId?: string;
  studentId?: string;
  onBackToProgress?: () => void;
  onReportSubmitted?: () => void;
}

export function WeeklyReportView({
  attention = mockStudentData.attention,
  initialReports = mockStudentData.weeklyReports,
  initialWeek = 5,
  internshipId,
  studentId,
  onBackToProgress,
  onReportSubmitted,
}: WeeklyReportViewProps) {
  const [reports, setReports] = useState<WeeklyReport[]>(initialReports);
  const [prevInitialReports, setPrevInitialReports] = useState<WeeklyReport[]>(initialReports);
  const [activeSubTab, setActiveSubTab] = useState<"form" | "history">("form");

  if (initialReports !== prevInitialReports) {
    setPrevInitialReports(initialReports);
    setReports(initialReports);
  }

  const handleReportSubmitted = (newReport: WeeklyReport) => {
    // Prepend newly submitted report to history
    setReports([newReport, ...reports]);
    if (onReportSubmitted) {
      onReportSubmitted();
    }
  };

  const pendingCount = reports.filter((r) => r.status === "Pending Review" || r.status === "Submitted").length;
  const reviewedCount = reports.filter((r) => r.status === "Reviewed").length;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Action Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          {onBackToProgress && (
            <button
              type="button"
              onClick={onBackToProgress}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>← Back to Progress</span>
            </button>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900">
              Weekly Internship Reporting
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Week {initialWeek} Submission Window
            </span>
          </div>
        </div>

        {/* Sub-view Toggles */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("form")}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === "form"
                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <DocumentTextIcon className="w-3.5 h-3.5" />
            <span>Submit Report</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("history")}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === "history"
                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            <span>Report History ({reports.length})</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Cycle</span>
          <div className="text-base font-bold text-slate-900 mt-0.5">Week {initialWeek} Report</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Submitted Logs</span>
          <div className="text-base font-bold text-indigo-600 mt-0.5">{reports.length} Total</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Awaiting Review</span>
          <div className="text-base font-bold text-amber-600 mt-0.5">{pendingCount} Pending</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Evaluated & Approved</span>
          <div className="text-base font-bold text-emerald-600 mt-0.5">{reviewedCount} Reviewed</div>
        </div>
      </div>

      {/* Attention Status Section (Item 4 in Task requirement) */}
      <AttentionStatusSection
        attention={attention}
        title="Internship Attention & Cadence Status"
      />

      {/* Main Content Area: Form & History */}
      {activeSubTab === "form" ? (
        <div className="space-y-6">
          <WeeklyReportForm
            initialWeek={initialWeek}
            internshipId={internshipId}
            studentId={studentId}
            onSubmitSuccess={handleReportSubmitted}
          />

          {/* Report History Below The Form (Requirement 3: "Below the form, show mock previous reports") */}
          <ReportHistoryList reports={reports} />
        </div>
      ) : (
        <ReportHistoryList reports={reports} />
      )}
    </div>
  );
}
