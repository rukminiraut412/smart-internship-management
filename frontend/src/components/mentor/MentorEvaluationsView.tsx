"use client";

import React, { useState } from "react";
import {
  TrendingUpIcon,
  PlusIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/common/Icons";
import { EvaluationItem, MentorInternItem, mentorsApi } from "@/lib/api";

interface Props {
  evaluations: EvaluationItem[];
  interns: MentorInternItem[];
  onEvaluationCreated: () => void;
  presetStudentId?: string;
  presetInternshipId?: string;
}

export function MentorEvaluationsView({
  evaluations,
  interns,
  onEvaluationCreated,
  presetStudentId,
  presetInternshipId,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentId, setStudentId] = useState(presetStudentId || interns[0]?.student_id || "");
  const [evaluationType, setEvaluationType] = useState<"Midterm" | "Final">("Midterm");
  const [rating, setRating] = useState<number>(4.8);
  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    const intern = interns.find((i) => i.student_id === studentId) || interns[0];
    if (!intern) {
      setErrorMsg("No active intern selected.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await mentorsApi.createEvaluation({
        student_id: intern.student_id,
        internship_id: presetInternshipId || intern.internship_id,
        evaluation_type: evaluationType,
        rating,
        comments: comments.trim() || undefined,
        recommendation: recommendation.trim() || undefined,
      });

      setSuccessMsg("Evaluation submitted and recorded successfully!");
      setComments("");
      setRecommendation("");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        onEvaluationCreated();
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to record evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Performance Evaluations</h2>
          <p className="text-xs text-slate-500">
            Submit formal institutional midterm and final assessments for university credits
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Formal Evaluation</span>
        </button>
      </div>

      {/* Evaluations List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
        {evaluations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No formal evaluations submitted yet. Click &quot;New Formal Evaluation&quot; to file an evaluation.
          </div>
        ) : (
          evaluations.map((ev) => (
            <div
              key={ev.id}
              className="p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0 border border-amber-200">
                  <TrendingUpIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {ev.evaluation_type} Evaluation
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Rating: {ev.rating} / 5.0
                    </span>
                  </div>

                  {ev.comments && (
                    <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed">
                      <strong>Comments:</strong> {ev.comments}
                    </p>
                  )}

                  {ev.recommendation && (
                    <div className="mt-2 text-xs text-indigo-700 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                      <strong>Recommendation:</strong> {ev.recommendation}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 mt-2">
                    Recorded Date: {ev.created_at ? ev.created_at.split("T")[0] : "Recently"}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Verified
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Evaluation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">File Formal Intern Evaluation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official milestone evaluation recorded for academic and host supervisor records
              </p>
            </div>

            {successMsg && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEvaluation} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Intern</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                >
                  {interns.map((i) => (
                    <option key={i.student_id} value={i.student_id}>
                      {i.student_name} ({i.student_id_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Evaluation Cycle</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEvaluationType("Midterm")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      evaluationType === "Midterm"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Midterm Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvaluationType("Final")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      evaluationType === "Final"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Final Evaluation
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall Score: <strong className="text-indigo-600 font-bold">{rating} / 5.0</strong>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Performance Comments</label>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Assess technical capability, velocity, communication, and independence..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recommendation / Conversion</label>
                <textarea
                  rows={2}
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="e.g. Recommend for return full-time offer / High distinction honors."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                />
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
                  {isSubmitting ? "Submitting..." : "Submit Formal Evaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
