"use client";

import React, { useState } from "react";
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  MailIcon,
  PlusIcon,
} from "@/components/common/Icons";
import { InternshipDetails } from "@/data/mockData";
import { BackendInternship } from "@/lib/api";
import { InternshipRegistrationView } from "./InternshipRegistrationView";

interface MyInternshipViewProps {
  internship: InternshipDetails;
  studentId?: string;
  onRegistrationSuccess?: (internship: BackendInternship) => void;
}

export function MyInternshipView({
  internship,
  studentId,
  onRegistrationSuccess,
}: MyInternshipViewProps) {
  const hasActiveInternship = Boolean(internship && internship.role && internship.company);
  const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(!hasActiveInternship);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <BriefcaseIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Internship</h1>
            <p className="text-xs text-slate-500">
              Active placement record, host organization supervisor, and registration portal.
            </p>
          </div>
        </div>

        {hasActiveInternship && (
          <button
            type="button"
            onClick={() => setShowRegistrationForm((prev) => !prev)}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>{showRegistrationForm ? "Hide Registration Form" : "Register Another Placement"}</span>
          </button>
        )}
      </div>

      {/* 2. Current Internship Card (if exists) */}
      {hasActiveInternship && (
        <section aria-label="Current Internship Details" className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{internship.role}</h2>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {internship.status || "Active"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-indigo-600 font-semibold mt-1">
                <BuildingOfficeIcon className="w-4 h-4" />
                <span>{internship.company}</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 self-start sm:self-auto">
              <span className="font-semibold text-slate-700">{internship.term || "Current Term"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 text-xs">
            {/* Column 1: Mentor / Supervisor */}
            <div className="rounded-lg bg-slate-50/70 p-3.5 border border-slate-100 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
                <UserIcon className="w-3.5 h-3.5" />
                <span>Host Organization Supervisor</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">{internship.mentor || "Assigned Supervisor"}</div>
              <div className="text-slate-500">{internship.mentorTitle || "Supervisor"}</div>
              {internship.mentorEmail && (
                <div className="flex items-center space-x-1 text-slate-600 pt-1">
                  <MailIcon className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{internship.mentorEmail}</span>
                </div>
              )}
            </div>

            {/* Column 2: Duration */}
            <div className="rounded-lg bg-slate-50/70 p-3.5 border border-slate-100 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Placement Duration</span>
              </div>
              <div className="font-semibold text-slate-800 text-xs">
                {internship.startDate} — {internship.endDate}
              </div>
              <div className="text-slate-500 pt-1">
                Cadence: <span className="font-medium text-slate-700">Weekly Progress Reporting</span>
              </div>
            </div>

            {/* Column 3: Location, Mode & Stipend */}
            <div className="rounded-lg bg-slate-50/70 p-3.5 border border-slate-100 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
                <MapPinIcon className="w-3.5 h-3.5" />
                <span>Location & Mode</span>
              </div>
              <div className="font-semibold text-slate-800 text-xs">{internship.location || "Remote"}</div>
              <div className="text-slate-500 pt-1">
                Stipend: <span className="font-medium text-slate-700">{internship.stipend || "Unpaid / Academic Credit"}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Internship Registration Form (shown if no internship or toggled open) */}
      {(!hasActiveInternship || showRegistrationForm) && (
        <section aria-label="Internship Registration">
          <div className="mb-2">
            <h2 className="text-base font-bold text-slate-900">
              {hasActiveInternship ? "Register Another Placement" : "Register Your Internship Placement"}
            </h2>
            <p className="text-xs text-slate-500">
              Submit placement details for academic monitoring and faculty mentor assignment.
            </p>
          </div>
          <InternshipRegistrationView
            studentId={studentId}
            onRegistrationSuccess={(newIntern) => {
              if (onRegistrationSuccess) {
                onRegistrationSuccess(newIntern);
              }
              setShowRegistrationForm(false);
            }}
          />
        </section>
      )}
    </div>
  );
}
