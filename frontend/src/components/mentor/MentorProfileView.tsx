"use client";

import React, { useState } from "react";
import {
  CheckCircleIcon,
  AlertCircleIcon,
  PencilSquareIcon,
} from "@/components/common/Icons";
import { MentorProfile, mentorsApi } from "@/lib/api";

interface Props {
  initialProfile: MentorProfile | null;
  onProfileUpdated: (updated: MentorProfile) => void;
}

export function MentorProfileView({ initialProfile, onProfileUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: initialProfile?.name || "Dr. Marcus Vance",
    email: initialProfile?.email || "m.vance@cloudscale.io",
    company_name: initialProfile?.company_name || "CloudScale Distributed Systems",
    job_title: initialProfile?.job_title || "Staff Systems Architect",
    department: initialProfile?.department || "Platform Infrastructure",
    phone: initialProfile?.phone || "+1 (555) 441-2099",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await mentorsApi.updateProfile({
        name: formData.name.trim(),
        company_name: formData.company_name.trim(),
        job_title: formData.job_title.trim(),
        department: formData.department.trim(),
        phone: formData.phone.trim(),
      });
      setSuccessMsg("Mentor profile updated and persisted successfully!");
      setIsEditing(false);
      onProfileUpdated(updated);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {formData.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{formData.name}</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Industry Mentor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {formData.job_title} • {formData.company_name}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{formData.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsEditing(!isEditing);
            setSuccessMsg(null);
            setErrorMsg(null);
          }}
          className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PencilSquareIcon className="w-4 h-4 text-slate-500" />
          <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2 shadow-2xs">
          <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2 shadow-2xs">
          <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form Card */}
      <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Professional & Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              disabled={!isEditing}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full rounded-xl border p-2.5 text-xs text-slate-800 ${
                isEditing
                  ? "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  : "border-slate-100 bg-slate-50 text-slate-600"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-500 cursor-not-allowed"
              title="Official email account is linked to authentication credentials"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
            <input
              type="text"
              required
              disabled={!isEditing}
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className={`w-full rounded-xl border p-2.5 text-xs text-slate-800 ${
                isEditing
                  ? "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  : "border-slate-100 bg-slate-50 text-slate-600"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Title / Role</label>
            <input
              type="text"
              required
              disabled={!isEditing}
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              className={`w-full rounded-xl border p-2.5 text-xs text-slate-800 ${
                isEditing
                  ? "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  : "border-slate-100 bg-slate-50 text-slate-600"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department / Division</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className={`w-full rounded-xl border p-2.5 text-xs text-slate-800 ${
                isEditing
                  ? "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  : "border-slate-100 bg-slate-50 text-slate-600"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full rounded-xl border p-2.5 text-xs text-slate-800 ${
                isEditing
                  ? "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  : "border-slate-100 bg-slate-50 text-slate-600"
              }`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
