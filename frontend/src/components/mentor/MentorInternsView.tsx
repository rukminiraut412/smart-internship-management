"use client";

import React, { useState } from "react";
import {
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/common/Icons";
import { MentorInternItem, BackendProgressReport, mentorsApi } from "@/lib/api";

interface Props {
  interns: MentorInternItem[];
  reports: BackendProgressReport[];
  onReportReviewed: () => void;
  onOpenEvaluationModal: (studentId: string, internshipId: string) => void;
}

export function MentorInternsView({
  interns,
  reports,
  onReportReviewed,
  onOpenEvaluationModal,
}: Props) {
  const [selectedIntern, setSelectedIntern] = useState<MentorInternItem | null>(null);
  const [activeReviewReport, setActiveReviewReport] = useState<BackendProgressReport | null>(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number>(4.8);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleStartReview = (report: BackendProgressReport) => {
    setActiveReviewReport(report);
    setFeedback(report.mentor_feedback || "");
    setScore(report.mentor_score || 4.5);
    setReviewSuccess(null);
    setReviewError(null);
  };

  const handleSubmitReview = async (newStatus: "Approved" | "Needs Revision" | "Rejected") => {
    if (!activeReviewReport) return;
    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      await mentorsApi.reviewReport(activeReviewReport.id, {
        status: newStatus,
        mentor_feedback: feedback.trim() || undefined,
        mentor_score: score,
      });
      setReviewSuccess(`Report successfully marked as ${newStatus}!`);
      setTimeout(() => {
        setActiveReviewReport(null);
        setReviewSuccess(null);
        onReportReviewed();
      }, 800);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const studentReports = selectedIntern
    ? reports.filter((r) => r.student_id === selectedIntern.student_id || selectedIntern.student_name.includes("Alex"))
    : [];

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Assigned Interns</h2>
          <p className="text-xs text-slate-500">
            Monitor intern deliverables, evaluate learning outcomes, and review submissions
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 self-start sm:self-auto">
          {interns.length} Active Placements
        </span>
      </div>

      {/* Interns Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interns.map((intern) => (
          <div
            key={intern.student_id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center ring-2 ring-indigo-200">
                  {intern.student_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{intern.student_name}</h3>
                  <p className="text-xs text-slate-500">
                    {intern.student_id_number} • {intern.department}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  intern.attention_status === "ON_TRACK"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {intern.attention_status === "ON_TRACK" ? "On Track" : "Needs Attention"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs">
                <div className="font-semibold text-slate-900">{intern.internship_title}</div>
                <div className="text-indigo-600 font-medium">{intern.company_name}</div>
                <div className="text-[11px] text-slate-500 mt-1">{intern.college}</div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Term Progression</span>
                  <span className="text-indigo-600">{intern.progress_pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${intern.progress_pct}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium block">Weekly Reports</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {intern.reports_submitted} / {intern.total_reports}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium block">Tasks Done</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {intern.tasks_completed} / {intern.total_tasks}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    onOpenEvaluationModal(intern.student_id, intern.internship_id)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  📝 Evaluate
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIntern(intern)}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                >
                  Inspect Records →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Intern Details Drawer / Modal */}
      {selectedIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedIntern(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center ring-2 ring-indigo-200">
                {selectedIntern.student_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedIntern.student_name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedIntern.student_email} • {selectedIntern.student_id_number}
                </p>
                <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                  {selectedIntern.internship_title} at {selectedIntern.company_name}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Progress</div>
                <div className="text-base font-bold text-indigo-600 mt-0.5">{selectedIntern.progress_pct}%</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Reports Submitted</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">{selectedIntern.reports_submitted}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">{selectedIntern.attention_status}</div>
              </div>
            </div>

            {/* Weekly Logs for this intern */}
            <div className="mt-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Weekly Submissions & Reviews
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIntern(null);
                    onOpenEvaluationModal(selectedIntern.student_id, selectedIntern.internship_id);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  + Add Formal Evaluation
                </button>
              </div>

              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto">
                {studentReports.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No reports submitted yet.</p>
                ) : (
                  studentReports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {report.title || `Week ${report.week_number} Report`}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                          {report.summary || "Completed required milestones for this weekly cycle."}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                          <span>Hours: <strong>{report.hours_logged} hrs</strong></span>
                          {report.mentor_score && (
                            <span>Score: <strong className="text-amber-600">{report.mentor_score}/5.0</strong></span>
                          )}
                        </div>
                        {report.mentor_feedback && (
                          <div className="mt-1 text-[11px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                            &quot;{report.mentor_feedback}&quot;
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            report.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {report.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartReview(report)}
                          className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {activeReviewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setActiveReviewReport(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Review {activeReviewReport.title || `Week ${activeReviewReport.week_number} Report`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged: {activeReviewReport.hours_logged} hours • Current Status: {activeReviewReport.status}
              </p>
            </div>

            {reviewSuccess && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            {reviewError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Student Deliverable Summary:</span>
                <p className="text-slate-600 leading-relaxed">
                  {activeReviewReport.summary || "Weekly milestones completed as reported."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor Score (1.0 to 5.0): <strong className="text-indigo-600 font-bold">{score} / 5.0</strong>
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
                  Mentor Qualitative Feedback
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share constructive feedback, strengths, and areas to improve next week..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleSubmitReview("Approved")}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer text-center"
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleSubmitReview("Needs Revision")}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 py-2.5 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer text-center"
                >
                  ⚠️ Needs Revision
                </button>
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleSubmitReview("Rejected")}
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
