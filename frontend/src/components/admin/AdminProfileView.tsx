import React from "react";
import { CheckCircleIcon } from "@/components/common/Icons";
import { UserProfile } from "@/lib/api";

interface Props {
  currentUser: UserProfile | null;
}

export function AdminProfileView({ currentUser }: Props) {
  const name = currentUser?.full_name || "System Administrator";
  const email = currentUser?.email || "admin@university.edu";

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{name}</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Institutional Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Office of Academic Internships & Industry Partnerships</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{email}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Account & Role Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-400 block font-medium">Administrator Name</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{name}</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-400 block font-medium">Authorized Email</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{email}</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-400 block font-medium">System Role</span>
            <span className="font-semibold text-indigo-700 text-sm mt-0.5 block">Full System Administrator</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-400 block font-medium">Security Scope</span>
            <span className="font-semibold text-emerald-700 text-sm mt-0.5 block">Cohort & Placement Management</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Active Session ID: <strong className="font-mono text-slate-700">{currentUser?.id || "admin-root-01"}</strong></span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Verified Admin Privileges
          </span>
        </div>
      </div>
    </div>
  );
}
