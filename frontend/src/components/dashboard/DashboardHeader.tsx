import React from "react";
import { StudentProfile, InternshipDetails } from "@/data/mockData";
import { UserIcon, BriefcaseIcon } from "@/components/common/Icons";

interface Props {
  student: StudentProfile;
  internship: InternshipDetails;
  onActionClick?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function DashboardHeader({ student, internship, onActionClick, onNavigateTab }: Props) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200 border border-indigo-500/30 backdrop-blur-xs mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Active Student Internship Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {student.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            {student.department} • {student.university}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateTab && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab("My Profile")}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-xs border border-white/10 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab("Internship Registration")}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                <BriefcaseIcon className="w-3.5 h-3.5" />
                <span>Register Internship</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onActionClick}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:shadow-emerald-500/25"
          >
            Submit Weekly Log
          </button>
        </div>
      </div>
    </div>
  );
}
