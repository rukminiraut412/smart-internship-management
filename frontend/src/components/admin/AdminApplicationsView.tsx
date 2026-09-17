"use client";

import React, { useState } from "react";
import {
  SearchIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "@/components/common/Icons";
import { AdminApplicationItem, adminApi } from "@/lib/api";

interface Props {
  applications: AdminApplicationItem[];
  onApplicationUpdated: () => void;
}

export function AdminApplicationsView({ applications, onApplicationUpdated }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = applications.filter((app) => {
    const matchesFilter = filterStatus === "All" || app.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.internship_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.company_name && app.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = async (id: string, newStatus: "Approved" | "Rejected") => {
    setLoadingId(id);
    setErrorMsg(null);
    try {
      await adminApi.updateApplicationStatus(id, newStatus);
      setSuccessMsg(`Application status updated to ${newStatus}!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      onApplicationUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update application status.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Internship Applications</h2>
          <p className="text-xs text-slate-500">
            Institutional review for student placements, host company agreements, and prerequisites
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {["All", "Pending", "Approved", "Rejected"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                filterStatus === st
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by student, internship, or company..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
        />
      </div>

      {/* Applications Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Internship Role</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Applied Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No applications found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{app.student_name}</div>
                    <div className="text-[11px] text-slate-400">{app.student_email}</div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {app.internship_title}
                  </td>
                  <td className="px-5 py-4 text-indigo-600 font-medium">
                    {app.company_name}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {app.applied_at ? app.applied_at.split("T")[0] : "Recently"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : app.status === "Rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-1.5">
                    {app.status === "Pending" ? (
                      <>
                        <button
                          type="button"
                          disabled={loadingId === app.id}
                          onClick={() => handleUpdateStatus(app.id, "Approved")}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={loadingId === app.id}
                          onClick={() => handleUpdateStatus(app.id, "Rejected")}
                          className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Decision Recorded</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
