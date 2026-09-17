"use client";

import React from "react";
import {
  UserIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  AlertCircleIcon,
} from "@/components/common/Icons";
import { MentorProfile, MentorInternItem, BackendProgressReport } from "@/lib/api";

interface Props {
  profile: MentorProfile | null;
  interns: MentorInternItem[];
  reports: BackendProgressReport[];
  onNavigateTab: (tab: string) => void;
  onOpenReviewReport: (report: BackendProgressReport) => void;
}

export function MentorDashboardView({
  profile,
  interns,
  reports,
  onNavigateTab,
  onOpenReviewReport,
}: Props) {
  const pendingReports = reports.filter(
    (r) => r.status === "Pending Submission" || r.status === "Under Review" || r.status === "Needs Revision"
  );
  const attentionInterns = interns.filter((i) => i.attention_status === "NEEDS_ATTENTION");

  return (
    <div className="space-y-5">
      {/* Mentor Hero Banner */}
      <div className="rounded-xl bg-slate-900 px-5 py-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-400 mb-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>Industry Mentor Workspace</span>
              <span>•</span>
              <span className="text-slate-300 truncate">{profile?.company_name || "CloudScale Distributed Systems"}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Welcome back, {profile?.name || "Mentor"}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {profile?.job_title || "Staff Systems Architect"} • {profile?.department || "Platform Infrastructure"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab("My Interns")}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-indigo-300" />
              <span>View Interns ({interns.length})</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab("Weekly Reports")}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-2xs cursor-pointer"
            >
              <DocumentTextIcon className="w-3.5 h-3.5" />
              <span>Pending Reviews ({pendingReports.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <section aria-label="Mentor Summary Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Assigned Interns */}
          <div
            onClick={() => onNavigateTab("My Interns")}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Assigned Interns</h2>
                  <p className="text-xs text-slate-500">Under Supervision</p>
                </div>
              </div>
              <span className="text-xl font-bold text-slate-900">{interns.length}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <span>Cohort Term</span>
              <span className="font-semibold text-indigo-600">Fall 2026</span>
            </div>
          </div>

          {/* Card 2: Interns Needing Attention */}
          <div
            onClick={() => onNavigateTab("My Interns")}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <AlertCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Needs Attention</h2>
                  <p className="text-xs text-slate-500">Early Intervention</p>
                </div>
              </div>
              <span className={`text-xl font-bold ${attentionInterns.length > 0 ? "text-amber-600" : "text-slate-900"}`}>
                {attentionInterns.length}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <span>Risk Status</span>
              <span className={`font-semibold ${attentionInterns.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                {attentionInterns.length > 0 ? "Action Recommended" : "All Interns On Track"}
              </span>
            </div>
          </div>

          {/* Card 3: Reports Pending Review */}
          <div
            onClick={() => onNavigateTab("Weekly Reports")}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Pending Reports</h2>
                  <p className="text-xs text-slate-500">Weekly Logs</p>
                </div>
              </div>
              <span className="text-xl font-bold text-rose-600">{pendingReports.length}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <span>Total Submitted</span>
              <span className="font-semibold text-slate-800">{reports.length} Reports</span>
            </div>
          </div>

          {/* Card 4: Active Internships */}
          <div
            onClick={() => onNavigateTab("My Interns")}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <BriefcaseIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Active Programs</h2>
                  <p className="text-xs text-slate-500">Mentored Roles</p>
                </div>
              </div>
              <span className="text-xl font-bold text-emerald-600">1</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <span>Avg Progression</span>
              <span className="font-semibold text-slate-800">
                {interns.length > 0 ? `${interns[0].progress_pct}%` : "33%"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Reports Awaiting Review Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Weekly Submissions</h3>
            <p className="text-xs text-slate-500">Review deliverables, verify hours, and provide feedback</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("Weekly Reports")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            View All Reports →
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No weekly reports submitted yet.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {reports.slice(0, 4).map((report) => (
              <div key={report.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-600 shrink-0 border border-slate-200">
                    <DocumentTextIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {report.title || `Week ${report.week_number} Report`}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {report.summary || "Weekly milestones and implementation logs."}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>Logged: <strong>{report.hours_logged} hrs</strong></span>
                      {report.mentor_score && (
                        <span>Score: <strong className="text-amber-600">{report.mentor_score} / 5.0</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                    onClick={() => onOpenReviewReport(report)}
                    className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Review / Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interns Quick Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Supervised Interns</h3>
            <p className="text-xs text-slate-500">Live progress tracking and milestone statuses</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("My Interns")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Manage All Interns →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {interns.map((intern) => (
            <div key={intern.student_id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{intern.student_name}</h4>
                  <p className="text-[11px] text-slate-500">{intern.student_id_number} • {intern.department}</p>
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

              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                  <span>Term Progress</span>
                  <span className="font-semibold text-indigo-600">{intern.progress_pct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${intern.progress_pct}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Reports: <strong>{intern.reports_submitted}/{intern.total_reports}</strong></span>
                <span>Tasks: <strong>{intern.tasks_completed}/{intern.total_tasks}</strong></span>
                <button
                  type="button"
                  onClick={() => onNavigateTab("My Interns")}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Open Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
