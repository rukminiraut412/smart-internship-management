"use client";

import React, { useState } from "react";
import {
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
} from "@/components/common/Icons";
import { WeeklyReport, ReportStatus } from "@/data/mockData";

interface ReportHistoryListProps {
  reports: WeeklyReport[];
}

export function ReportHistoryList({ reports }: ReportHistoryListProps) {
  const [filter, setFilter] = useState<"ALL" | ReportStatus>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(reports[0]?.id || null);

  const filteredReports = reports.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "Reviewed":
        return {
          label: "Reviewed",
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dotColor: "bg-emerald-500",
          icon: CheckCircleIcon,
        };
      case "Pending Review":
        return {
          label: "Pending Review",
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
          dotColor: "bg-amber-500",
          icon: ClockIcon,
        };
      case "Submitted":
        return {
          label: "Submitted",
          badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
          dotColor: "bg-sky-500",
          icon: ClockIcon,
        };
      default:
        return {
          label: status,
          badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
          dotColor: "bg-slate-400",
          icon: AlertCircleIcon,
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Report Submission History
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical logs, mentor evaluations, ratings, and feedback reviews
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {(["ALL", "Reviewed", "Pending Review", "Submitted"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === status
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Count Banner */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong>{filteredReports.length}</strong> of {reports.length} total submissions
        </span>
        <span className="text-[11px] text-slate-400">Click any card to expand full report details</span>
      </div>

      {/* List of Report Cards */}
      <div className="mt-3 space-y-3">
        {filteredReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            No weekly reports found matching status filter &ldquo;{filter}&rdquo;.
          </div>
        ) : (
          filteredReports.map((report) => {
            const isExpanded = expandedId === report.id;
            const badge = getStatusBadge(report.status);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={report.id}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? "border-indigo-300 bg-linear-to-b from-white to-indigo-50/10 shadow-xs ring-2 ring-indigo-500/10"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {/* Header Row (Always visible) */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center space-x-3.5">
                    {/* Week Badge */}
                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-2xs">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-indigo-300">
                        Wk
                      </span>
                      <span className="text-xs font-black">{report.weekNumber}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Week {report.weekNumber} Report
                        </span>
                        <span
                          className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${badge.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dotColor}`} />
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                        {report.mentorScore && (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                            ★ {report.mentorScore} / 5.0
                          </span>
                        )}
                      </div>

                      {/* Short Summary */}
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 max-w-xl">
                        {report.shortSummary}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-slate-400" />
                          Submitted: {report.submissionDate}
                        </span>
                        <span>•</span>
                        <span>Date Range: {report.startDate} to {report.endDate}</span>
                        {report.hoursLogged && (
                          <>
                            <span>•</span>
                            <span>{report.hoursLogged} hrs logged</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Mentor Feedback Status & Chevron */}
                  <div className="flex items-center justify-between md:justify-end space-x-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                        Mentor Feedback
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        {report.mentorFeedbackStatus || (report.status === "Reviewed" ? "Reviewed" : "Pending Review")}
                      </div>
                    </div>

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

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs animate-fadeIn">
                    {/* Mentor Feedback Banner (if present) */}
                    {report.mentorFeedback ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="text-xs font-bold text-emerald-950">
                              Mentor Feedback & Evaluation
                            </span>
                          </div>
                          {report.mentorScore && (
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Evaluation Score: {report.mentorScore} / 5.0
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-emerald-900 leading-relaxed italic">
                          &ldquo;{report.mentorFeedback}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900 flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Mentor evaluation in progress. You will be notified when your mentor submits feedback.
                        </span>
                      </div>
                    )}

                    {/* Detailed Section 1: Work Description */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Work Description
                      </h4>
                      <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                        {report.workDescription}
                      </div>
                    </div>

                    {/* Detailed Section 2: Tasks Completed */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Tasks Completed
                      </h4>
                      <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                        {report.tasksCompleted}
                      </div>
                    </div>

                    {/* Skills Learned & Challenges Dual Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Skills Learned */}
                      <div>
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                          Skills Learned
                        </h4>
                        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          {report.skillsLearned.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Next Week Plan */}
                      <div>
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                          Next Week&apos;s Plan
                        </h4>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed text-[11px]">
                          {report.nextWeekPlan}
                        </div>
                      </div>
                    </div>

                    {/* Challenges Faced */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Challenges Faced & Mitigations
                      </h4>
                      <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-slate-700 leading-relaxed">
                        {report.challengesFaced}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
