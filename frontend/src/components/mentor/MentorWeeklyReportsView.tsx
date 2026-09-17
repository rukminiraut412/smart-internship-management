"use client";

import React, { useState } from "react";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SearchIcon,
  XIcon,
} from "@/components/common/Icons";
import { BackendProgressReport, mentorsApi } from "@/lib/api";

interface Props {
  reports: BackendProgressReport[];
  onReportReviewed: () => void;
}

export function MentorWeeklyReportsView({ reports, onReportReviewed }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeReport, setActiveReport] = useState<BackendProgressReport | null>(null);
  const [score, setScore] = useState<number>(4.8);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = reports.filter((r) => {
    const matchesFilter =
      filterStatus === "All"
        ? true
        : filterStatus === "Pending"
        ? r.status === "Pending Submission" || r.status === "Under Review"
        : r.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.summary && r.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleOpenReview = (report: BackendProgressReport) => {
    setActiveReport(report);
    setScore(report.mentor_score || 4.5);
    setFeedback(report.mentor_feedback || "");
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleReviewAction = async (status: "Approved" | "Needs Revision" | "Rejected") => {
    if (!activeReport) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await mentorsApi.reviewReport(activeReport.id, {
        status,
        mentor_score: score,
        mentor_feedback: feedback.trim() || undefined,
      });
      setSuccessMsg(`Report marked as ${status}!`);
      setTimeout(() => {
        setActiveReport(null);
        setSuccessMsg(null);
        onReportReviewed();
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to review report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Weekly Progress Reports</h2>
          <p className="text-xs text-slate-500">
            Review student log submissions, evaluate technical deliverables, and assign weekly scores
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["All", "Pending", "Approved", "Needs Revision"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                filterStatus === st
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by report title or deliverables..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
        />
      </div>

      {/* Reports List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No progress reports found matching the selected filter.
          </div>
        ) : (
          filtered.map((report) => (
            <div
              key={report.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100">
                  <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {report.title || `Week ${report.week_number} Progress Report`}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        report.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : report.status === "Needs Revision"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 max-w-xl line-clamp-2">
                    {report.summary || "Weekly milestones completed as reported."}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                    <span>Week: <strong>{report.week_number}</strong></span>
                    <span>Logged: <strong>{report.hours_logged} hrs</strong></span>
                    {report.mentor_score && (
                      <span>Score: <strong className="text-amber-600">{report.mentor_score} / 5.0</strong></span>
                    )}
                    <span>Submitted: {report.submission_date ? report.submission_date.split("T")[0] : "Recently"}</span>
                  </div>

                  {report.mentor_feedback && (
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <strong className="text-slate-700">Feedback:</strong> &quot;{report.mentor_feedback}&quot;
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleOpenReview(report)}
                  className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Review Report</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setActiveReport(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Grade {activeReport.title || `Week ${activeReport.week_number}`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Week {activeReport.week_number} • Logged {activeReport.hours_logged} Hours
              </p>
            </div>

            {successMsg && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Student Deliverable Summary:</span>
                <p className="text-slate-600 leading-relaxed">
                  {activeReport.summary || "Milestones and progress logged."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor Score: <strong className="text-indigo-600 font-bold">{score} / 5.0</strong>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qualitative Feedback
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Notes on code quality, testing adherence, and weekly growth..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleReviewAction("Approved")}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer text-center"
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleReviewAction("Needs Revision")}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 py-2.5 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer text-center"
                >
                  ⚠️ Revision
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleReviewAction("Rejected")}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer text-center"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
