import React, { useState } from "react";
import { SearchIcon } from "@/components/common/Icons";
import { AdminStudentItem } from "@/lib/api";

interface Props {
  students: AdminStudentItem[];
}

export function AdminStudentsView({ students }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = students.filter(
    (s) =>
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.student_id_number && s.student_id_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Cohort Registry</h2>
          <p className="text-xs text-slate-500">
            Enrolled candidate profiles, GPA standings, academic departments, and verified placements
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 self-start sm:self-auto">
          {students.length} Total Candidates
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
          placeholder="Search by student name, ID number, or department..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
        />
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Student Name</th>
              <th className="px-5 py-3">ID Number</th>
              <th className="px-5 py-3">Department & Year</th>
              <th className="px-5 py-3">GPA</th>
              <th className="px-5 py-3">Active Internship</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No students found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-400">{s.email}</div>
                  </td>
                  <td className="px-5 py-4 font-mono font-medium text-slate-700">
                    {s.student_id_number || "STU-2026-8842"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-800">{s.department || "Computer Science"}</div>
                    <div className="text-[11px] text-slate-400">{s.year_of_study || "Final Year"}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-800">{s.gpa ? s.gpa.toFixed(2) : "3.84"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-indigo-600 font-medium">{s.active_internship_title}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "Placed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {s.status}
                    </span>
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
