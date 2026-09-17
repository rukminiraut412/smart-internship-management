import React from "react";
import { BriefcaseIcon } from "@/components/common/Icons";
import { InternshipDetails } from "@/data/mockData";

interface Props {
  internship: InternshipDetails;
  onNavigateToInternship?: () => void;
}

export function InternshipStatusCard({ internship, onNavigateToInternship }: Props) {
  return (
    <div
      onClick={onNavigateToInternship}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all ${
        onNavigateToInternship ? "cursor-pointer hover:border-indigo-300" : ""
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <BriefcaseIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Internship Status</h2>
            <p className="text-xs text-slate-500">Placement & Mentorship</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          {internship.status}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="text-base font-bold text-slate-900">{internship.role}</div>
          <div className="text-xs font-medium text-indigo-600">{internship.company}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <span className="text-slate-400 block font-medium">Assigned Mentor</span>
            <span className="text-slate-800 font-semibold truncate block mt-0.5">{internship.mentor}</span>
            <span className="text-[11px] text-slate-500 block truncate">{internship.mentorTitle}</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <span className="text-slate-400 block font-medium">Location & Mode</span>
            <span className="text-slate-800 font-semibold block mt-0.5">{internship.location}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">{internship.stipend}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <span>Duration: <strong className="text-slate-700">{internship.startDate} — {internship.endDate}</strong></span>
        </div>
      </div>
    </div>
  );
}
