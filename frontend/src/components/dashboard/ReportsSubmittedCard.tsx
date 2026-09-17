import React from "react";
import {
  ClipboardCheckIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@/components/common/Icons";
import { ReportItem } from "@/data/mockData";

interface Props {
  reports: ReportItem[];
  onNavigateToReports?: () => void;
}

export function ReportsSubmittedCard({
  reports,
  onNavigateToReports,
}: Props) {
  const approvedCount = reports.filter(
    (report) => report.status === "Approved"
  ).length;

  const pendingCount = reports.filter(
    (report) => report.status === "Pending Submission"
  ).length;

  const totalReports = reports.length;

  const completionPct =
    totalReports > 0
      ? Math.round((approvedCount / totalReports) * 100)
      : 0;

  return (
    <div
      onClick={onNavigateToReports}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all ${
        onNavigateToReports
          ? "cursor-pointer hover:border-indigo-300"
          : ""
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
            <ClipboardCheckIcon className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Reports
            </h2>
            <p className="text-xs text-slate-500">
              Weekly Cadence
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-bold text-teal-600">
            {approvedCount}
          </span>

          <span className="text-xs text-slate-400">
            /{reports.length} Submitted
          </span>

          {pendingCount > 0 && (
            <div className="text-[11px] font-semibold text-amber-600">
              {pendingCount} Pending
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Approved reports
          </span>

          <span className="text-xs font-bold text-teal-600">
            {completionPct}%
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          <CheckCircleIcon className="h-4 w-4 text-emerald-600" />

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Approved
            </p>

            <p className="text-sm font-bold text-slate-800">
              {approvedCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
          <ClockIcon className="h-4 w-4 text-amber-600" />

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Pending
            </p>

            <p className="text-sm font-bold text-slate-800">
              {pendingCount}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={onNavigateToReports}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50"
        >
          {pendingCount > 0
            ? "Submit Weekly Report →"
            : "View Report History →"}
        </button>
      </div>
    </div>
  );
}