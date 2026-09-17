"use client";

import React from "react";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  UserIcon,
  DocumentTextIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@/components/common/Icons";
import { AdminStats, AdminApplicationItem } from "@/lib/api";

interface Props {
  stats: AdminStats;
  applications: AdminApplicationItem[];
  onNavigateTab: (tab: string) => void;
  onApproveApplication: (id: string) => void;
  onRejectApplication: (id: string) => void;
}

export function AdminDashboardView({
  stats,
  applications,
  onNavigateTab,
  onApproveApplication,
  onRejectApplication,
}: Props) {
  const pendingApps = applications.filter((a) => a.status === "Pending");

  const cards = [
    {
      title: "Total Students",
      value: stats.total_students,
      desc: "Enrolled candidates",
      icon: AcademicCapIcon,
      color: "bg-indigo-50 text-indigo-600",
      tab: "Students",
    },
    {
      title: "Active Internships",
      value: stats.active_internships,
      desc: "Verified active placements",
      icon: BriefcaseIcon,
      color: "bg-blue-50 text-blue-600",
      tab: "Internships",
    },
    {
      title: "Total Companies",
      value: stats.total_companies,
      desc: "Industry partners",
      icon: BuildingOfficeIcon,
      color: "bg-emerald-50 text-emerald-600",
      tab: "Internships",
    },
    {
      title: "Total Mentors",
      value: stats.total_mentors,
      desc: "Registered supervisors",
      icon: UserIcon,
      color: "bg-violet-50 text-violet-600",
      tab: "Mentors",
    },
    {
      title: "Pending Applications",
      value: stats.pending_applications,
      desc: "Requires institutional review",
      icon: DocumentTextIcon,
      color: "bg-amber-50 text-amber-600",
      highlight: stats.pending_applications > 0,
      tab: "Applications",
    },
    {
      title: "Reports Pending Review",
      value: stats.reports_pending_review,
      desc: "Unapproved weekly submissions",
      icon: ClockIcon,
      color: "bg-rose-50 text-rose-600",
      tab: "Reports & Alerts",
    },
    {
      title: "Needs Attention",
      value: stats.students_needing_attention,
      desc: "Low-score or at-risk interns",
      icon: AlertCircleIcon,
      color: "bg-amber-50 text-amber-600",
      tab: "Reports & Alerts",
    },
    {
      title: "Completed Internships",
      value: stats.completed_internships,
      desc: "Graduated placements",
      icon: CheckCircleIcon,
      color: "bg-slate-100 text-slate-700",
      tab: "Internships",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Hero Header */}
      <div className="rounded-xl bg-slate-900 px-5 py-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-400 mb-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>Institutional Administration Console</span>
              <span>•</span>
              <span className="text-slate-300">University Cohort 2026</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              System Operations Overview
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Real-time telemetry across student cohorts, company partnerships, and mentorship placements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab("Applications")}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
            >
              <DocumentTextIcon className="w-3.5 h-3.5" />
              <span>Review Applications ({pendingApps.length})</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab("Mentors")}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-indigo-300" />
              <span>Mentors Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Clean KPI Cards */}
      <section aria-label="System Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                onClick={() => onNavigateTab(c.tab)}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${c.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{c.title}</h2>
                      <p className="text-[11px] text-slate-500">{c.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">{c.value}</span>
                  <span className="text-[11px] font-semibold text-indigo-600 hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pending Applications Action Box */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Internship Applications Awaiting Approval</h3>
            <p className="text-xs text-slate-500">
              Verify eligibility, approve candidate placements, or request institutional adjustments
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("Applications")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            View All Applications →
          </button>
        </div>

        {pendingApps.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No pending applications requiring approval at this time.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {pendingApps.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {app.student_name} ({app.student_id_number || "STU-2026"})
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Applied for <strong>{app.internship_title}</strong> at <strong>{app.company_name}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Applied on: {app.applied_at ? app.applied_at.split("T")[0] : "Recently"}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => onApproveApplication(app.id)}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectApplication(app.id)}
                    className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
