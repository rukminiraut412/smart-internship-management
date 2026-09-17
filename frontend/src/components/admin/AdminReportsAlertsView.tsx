import React, { useState } from "react";
import { DocumentTextIcon, AlertCircleIcon } from "@/components/common/Icons";
import { AdminReportAlertItem } from "@/lib/api";

interface Props {
  items: AdminReportAlertItem[];
}

export function AdminReportsAlertsView({ items }: Props) {
  const [filterType, setFilterType] = useState<string>("All");

  const filtered = items.filter((i) => filterType === "All" || i.type === filterType);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Reports & Early-Warning Alerts</h2>
          <p className="text-xs text-slate-500">
            Systemic oversight on progress consistency, pending mentor reviews, and risk indicators
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {["All", "Report", "Alert"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                filterType === t
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              }`}
            >
              {t === "Report" ? "Reports Pending" : t === "Alert" ? "Risk Alerts" : "All Items"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active reports or alerts found.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 border ${
                    item.type === "Alert"
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-indigo-50 text-indigo-600 border-indigo-100"
                  }`}
                >
                  {item.type === "Alert" ? (
                    <AlertCircleIcon className="w-5 h-5" />
                  ) : (
                    <DocumentTextIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.severity === "Critical"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : item.severity === "Warning"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5">
                    Candidate: <strong>{item.student_name}</strong> • Placement: {item.internship_title || "Backend Engineering"}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Timestamp: {item.date ? item.date.split("T")[0] : "Recently"} • Status: {item.status}
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold self-end sm:self-auto ${
                  item.status === "Approved" || item.status === "Resolved"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
