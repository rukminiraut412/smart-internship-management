import React from "react";
import { BriefcaseIcon } from "@/components/common/Icons";
import { InternshipDetails } from "@/data/mockData";

interface Props {
  internship: InternshipDetails;
  onNavigateToInternship?: () => void;
}

export function InternshipStatusCard({
  internship,
  onNavigateToInternship,
}: Props) {
  return (
    <div
      onClick={onNavigateToInternship}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all ${
        onNavigateToInternship
          ? "cursor-pointer hover:border-indigo-300"
          : ""
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <BriefcaseIcon className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Internship
            </h2>

            <p className="text-[11px] text-slate-500">
              Current placement
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {internship.status}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="truncate text-base font-bold text-slate-900">
          {internship.role}
        </h3>

        <p className="mt-1 truncate text-xs font-semibold text-indigo-600">
          {internship.company}
        </p>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Duration
          </span>

          <span className="font-medium text-slate-700">
            {internship.startDate} — {internship.endDate}
          </span>
        </div>
      </div>
    </div>
  );
}