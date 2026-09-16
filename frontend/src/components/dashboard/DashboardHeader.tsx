import React from "react";
import { StudentProfile, InternshipDetails } from "@/data/mockData";
import {
  BriefcaseIcon,
  ArrowRightIcon,
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
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Left - Welcome */}
        <div className="min-w-0">

          {/* Status */}
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Internship Active
          </div>

          {/* Heading */}
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Welcome back, {student.name}
          </h1>

          {/* Student Info */}
          <p className="mt-1 text-sm text-slate-500">
            {student.department} • {student.university}
          </p>

          {/* Internship Info */}
          {internship?.role && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-800">
                {internship.role}
              </span>

              <span className="text-slate-300">•</span>

              <span className="font-medium text-indigo-600">
                {internship.company}
              </span>
            </div>
          )}
        </div>

        {/* Right - Actions */}
        <div className="flex flex-wrap items-center gap-2">

          {/* My Internship */}
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("My Internship")}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              <BriefcaseIcon className="h-3.5 w-3.5" />
              My Internship
            </button>
          )}

          {/* Weekly Report */}
          {onActionClick && (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Submit Weekly Report
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          )}

        </div>
      </div>
    </section>
  );
}
