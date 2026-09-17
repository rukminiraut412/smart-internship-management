"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/common/Icons";
import { AdminMentorItem, AdminInternshipItem, adminApi } from "@/lib/api";

interface Props {
  mentors: AdminMentorItem[];
  internships: AdminInternshipItem[];
  onMentorAssigned: () => void;
}

export function AdminMentorsView({ mentors, internships, onMentorAssigned }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInternshipId, setSelectedInternshipId] = useState(internships[0]?.id || "");
  const [selectedMentorId, setSelectedMentorId] = useState(mentors[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternshipId || !selectedMentorId) {
      setErrorMsg("Please select both an internship and a mentor.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await adminApi.assignMentor({
        internship_id: selectedInternshipId,
        mentor_id: selectedMentorId,
      });

      setSuccessMsg(res.message || "Mentor successfully assigned to internship!");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        onMentorAssigned();
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to assign mentor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mentor Supervision Network</h2>
          <p className="text-xs text-slate-500">
            Registered industry mentors, partner organizations, and active internship supervision
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setSuccessMsg(null);
            setErrorMsg(null);
          }}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Assign Mentor to Internship</span>
        </button>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Mentors Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 font-bold text-sm flex items-center justify-center border border-violet-100">
                  {mentor.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{mentor.name}</h3>
                  <p className="text-xs text-slate-500">{mentor.job_title} • {mentor.company_name}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Verified Mentor
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Email:</span>
                <span className="font-semibold text-slate-800">{mentor.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Department:</span>
                <span className="font-semibold text-slate-800">{mentor.department || "Engineering"}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Contact Phone:</span>
                <span className="font-semibold text-slate-800">{mentor.phone || "+1 (555) 441-2099"}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Assigned Interns: <strong className="text-slate-900">{mentor.assigned_interns_count}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedMentorId(mentor.id);
                  setIsModalOpen(true);
                }}
                className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Assign Placement →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Mentor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Assign Mentor to Internship</h3>
              <p className="text-xs text-slate-500 mt-0.5">Link an industry supervisor to manage an active placement</p>
            </div>

            {errorMsg && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAssignMentor} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Internship</label>
                <select
                  value={selectedInternshipId}
                  onChange={(e) => setSelectedInternshipId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                >
                  {internships.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title} ({i.company_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Mentor</label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                >
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.company_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
