"use client";

import React, { useState } from "react";
import { BriefcaseIcon, SearchIcon } from "@/components/common/Icons";
import { AdminInternshipItem } from "@/lib/api";

interface Props {
  internships: AdminInternshipItem[];
}

export function AdminInternshipsView({ internships }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = internships.filter(
    (i) =>
      !searchTerm ||
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.company_name && i.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.domain && i.domain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Internship Programs & Positions</h2>
          <p className="text-xs text-slate-500">
            Employer partner placements, supervision assignments, and application capacity
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 self-start sm:self-auto">
          {internships.length} Registered Positions
        </span>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by role title, partner company, or engineering domain..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <BriefcaseIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-indigo-600 font-medium">{item.company_name}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {item.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Assigned Mentor</span>
                <span className="font-semibold text-slate-800 block truncate mt-0.5">
                  {item.mentor_name || "Dr. Marcus Vance"}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Domain / Mode</span>
                <span className="font-semibold text-slate-800 block truncate mt-0.5">
                  {item.domain || "Cloud"} • {item.mode}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Stipend: <strong className="text-slate-800">{item.stipend || "$1,800 / mo"}</strong></span>
              <span className="font-semibold text-indigo-600">{item.applicant_count} Applicants</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
