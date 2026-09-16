import React from "react";
import { StudentProfile, InternshipDetails } from "@/data/mockData";

interface Props {
  student: StudentProfile;
  internship: InternshipDetails;
  onActionClick?: () => void;
}

export function DashboardHeader({ student, internship, onActionClick }: Props) {
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-xs border border-white/10 text-left">
            <span className="text-[11px] text-indigo-200 font-medium block">Current Placement</span>
            <span className="text-xs font-bold text-white block truncate max-w-[200px]">
              {internship.company}
            </span>
          </div>

          <button
            type="button"
            onClick={onActionClick}
            className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:shadow-indigo-500/25"
          >
            Submit Weekly Log
          </button>
        </div>
      </div>
    </div>
  );
}
