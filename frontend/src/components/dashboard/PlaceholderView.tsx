import React from "react";
import { ArrowRightIcon } from "@/components/common/Icons";

interface Props {
  tabName: string;
  onBackToDashboard: () => void;
}

const descriptions: Record<string, { subtitle: string; details: string; sampleCount: string }> = {
  "My Profile": {
    subtitle: "Student Credentials & Academic Records",
    details: "Manage personal bio, department enrollment, uploaded resumes, and self-declared skill proficiencies.",
    sampleCount: "Verified Student Profile #STU-2026-8842",
  },
  "Internships": {
    subtitle: "Discover Active Institutional Positions",
    details: "Explore verified employer listings, prerequisite skill profiles, stipends, and mentor-approved openings.",
    sampleCount: "12 Available Positions in Fall 2026",
  },
  "Applications": {
    subtitle: "Track Submission Statuses & Offers",
    details: "Review current placement applications, mentor reviews, interview feedback, and formal acceptance letters.",
    sampleCount: "1 Active Placement • 2 Historical Applications",
  },
  "Progress": {
    subtitle: "Detailed Reporting & Milestone Analytics",
    details: "Submit weekly logs, track accumulated hours, document technical blockers, and view mentor evaluation trends.",
    sampleCount: "5 Weekly Submissions (1 Pending)",
  },
  "Skill Gap": {
    subtitle: "Explainable Skill Alignment & Learning Paths",
    details: "Compare your declared skills with target internship expectations and view tailored learning recommendations.",
    sampleCount: "83% Match for Backend Engineering Role",
  },
  "Notifications": {
    subtitle: "Alerts & Mentorship Updates",
    details: "Stay informed with weekly report reminders, evaluation comments, and early-intervention check-in alerts.",
    sampleCount: "2 Unread Notifications",
  },
};

export function PlaceholderView({ tabName, onBackToDashboard }: Props) {
  const info = descriptions[tabName] || {
    subtitle: "Module Under Construction",
    details: "This section is part of the planned 48-hour hackathon student frontend roadmap.",
    sampleCount: "Ready for integration",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto my-8">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-xl mb-4 ring-8 ring-indigo-50/50">
        {tabName.slice(0, 2).toUpperCase()}
      </div>

      <h2 className="text-xl font-bold text-slate-900">{tabName}</h2>
      <p className="text-xs font-semibold text-indigo-600 mt-1 uppercase tracking-wider">{info.subtitle}</p>

      <p className="text-sm text-slate-600 mt-3 max-w-md mx-auto leading-relaxed">
        {info.details}
      </p>

      <div className="mt-6 inline-block rounded-lg bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 border border-slate-100">
        Status: <span className="font-semibold text-slate-700">{info.sampleCount}</span>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <span>Return to Student Dashboard</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
