import React from "react";
import { StudentProfile, InternshipDetails } from "@/data/mockData";
import {
  BriefcaseIcon,
  DocumentTextIcon,
} from "@/components/common/Icons";

interface Props {
  student: StudentProfile;
  internship: InternshipDetails;
  onActionClick?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function DashboardHeader({
  student,
  internship,
  onActionClick,
  onNavigateTab,
}: Props) {
  return (
    <div className="rounded-xl bg-slate-900 px-5 py-4 text-white shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-400 mb-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Student Internship Portal</span>
            <span>•</span>
            <span className="text-slate-300 truncate">
              {student.department}
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Welcome back, {student.name}
          </h1>

          {internship?.role && (
            <p className="text-xs text-slate-300 mt-0.5">
              {internship.role} at{" "}
              <strong className="text-indigo-300 font-semibold">
                {internship.company}
              </strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("My Internship")}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              <BriefcaseIcon className="w-3.5 h-3.5 text-indigo-300" />
              <span>My Internship</span>
            </button>
          )}

          {onActionClick && (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-2xs"
            >
              <DocumentTextIcon className="w-3.5 h-3.5" />
              <span>Weekly Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}