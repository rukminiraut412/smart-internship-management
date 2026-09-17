import React from "react";
import { ClipboardCheckIcon, CheckCircleIcon, ClockIcon } from "@/components/common/Icons";
import { ReportItem } from "@/data/mockData";

interface Props {
  reports: ReportItem[];
  onNavigateToReports?: () => void;
}

export function ReportsSubmittedCard({ reports, onNavigateToReports }: Props) {
  const approvedCount = reports.filter((r) => r.status === "Approved").length;
  const pendingCount = reports.filter((r) => r.status === "Pending Submission").length;

  return (
    <div
      onClick={onNavigateToReports}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all ${
        onNavigateToReports ? "cursor-pointer hover:border-indigo-300" : ""
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
            <ClipboardCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Reports</h2>
            <p className="text-xs text-slate-500">Weekly Cadence</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-teal-600">{approvedCount}</span>
          <span className="text-xs text-slate-400">/{reports.length} Submitted</span>
          {pendingCount > 0 && (
            <div className="text-[11px] font-semibold text-amber-600">{pendingCount} Pending</div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {reports.map((report) => (
          <div
            key={report.week}
            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs"
          >
            <div className="flex items-center space-x-2">
              {report.status === "Approved" ? (
                <CheckCircleIcon className="w-4 h-4 text-teal-500" />
              ) : (
                <ClockIcon className="w-4 h-4 text-amber-500" />
              )}
              <span className="font-semibold text-slate-800">Week {report.week} Report</span>
              {report.mentorScore && (
                <span className="text-[11px] text-slate-400 font-medium">({report.mentorScore}/5.0)</span>
              )}
            </div>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                report.status === "Approved"
                  ? "bg-teal-100 text-teal-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {report.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">{pendingCount} report requires submission</span>
        <button
          type="button"
          onClick={onNavigateToReports}
          className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          Submit Log →
        </button>
      </div>
    </div>
  );
}
