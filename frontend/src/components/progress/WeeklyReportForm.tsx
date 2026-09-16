"use client";

import React, { useState } from "react";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SendIcon,
  BookmarkIcon,
} from "@/components/common/Icons";
import { WeeklyReport } from "@/data/mockData";
import { internshipsApi, ApiError } from "@/lib/api";

interface WeeklyReportFormProps {
  initialWeek?: number;
  internshipId?: string;
  studentId?: string;
  onSubmitSuccess: (report: WeeklyReport) => void;
}

interface FormErrors {
  weekNumber?: string;
  startDate?: string;
  endDate?: string;
  tasksCompleted?: string;
  workDescription?: string;
  skillsLearned?: string;
  challengesFaced?: string;
  nextWeekPlan?: string;
}

const COMMON_SKILLS = [
  "FastAPI",
  "PostgreSQL",
  "Docker",
  "Redis",
  "Pytest",
  "AsyncIO",
  "Pydantic v2",
  "Alembic",
  "REST APIs",
  "CI/CD Pipelines",
];

export function WeeklyReportForm({
  initialWeek = 5,
  internshipId,
  studentId,
  onSubmitSuccess,
}: WeeklyReportFormProps) {
  const [weekNumber, setWeekNumber] = useState<number>(initialWeek);
  const [prevInitialWeek, setPrevInitialWeek] = useState<number>(initialWeek);

  // Sync state if initialWeek changes from outside (standard React pattern without useEffect cascading renders)
  if (initialWeek !== prevInitialWeek) {
    setPrevInitialWeek(initialWeek);
    setWeekNumber(initialWeek);
  }

  const [startDate, setStartDate] = useState<string>("2026-09-13");
  const [endDate, setEndDate] = useState<string>("2026-09-19");
  const [hoursLogged, setHoursLogged] = useState<number>(20);
  const [tasksCompleted, setTasksCompleted] = useState<string>(
    "• Wrote comprehensive pytest integration test suite with synthetic fixtures\n• Validated Redis cache invalidation hooks on simulated telemetry updates\n• Monitored API latency benchmarks under 200 concurrent simulated requests"
  );
  const [workDescription, setWorkDescription] = useState<string>(
    "Authored integration test modules for telemetry endpoints in FastAPI, ensuring full schema compliance and >85% test coverage. Integrated Docker compose testing environment with isolated PostgreSQL and Redis instances for continuous local testing."
  );
  const [skillsLearned, setSkillsLearned] = useState<string[]>([
    "Pytest Fixtures",
    "Redis Caching",
    "Integration Testing",
  ]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [challengesFaced, setChallengesFaced] = useState<string>(
    "Race conditions during concurrent async database session disposal in pytest runner; resolved by isolating event loop fixtures across test modules."
  );
  const [nextWeekPlan, setNextWeekPlan] = useState<string>(
    "Benchmark Redis caching hit-ratio under burst traffic and draft mid-term technical architecture presentation for mentor review."
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Skill tag addition
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skillsLearned.includes(trimmed)) return;
    setSkillsLearned([...skillsLearned, trimmed]);
    setSkillInput("");
    if (errors.skillsLearned) {
      setErrors((prev: FormErrors) => ({ ...prev, skillsLearned: undefined }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsLearned(skillsLearned.filter((s) => s !== skillToRemove));
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!weekNumber || weekNumber < 1 || weekNumber > 12) {
      newErrors.weekNumber = "Week number must be between 1 and 12";
    }

    if (!startDate) {
      newErrors.startDate = "Week start date is required";
    }

    if (!endDate) {
      newErrors.endDate = "Week end date is required";
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "Week end date must be on or after start date";
    }

    if (!tasksCompleted.trim()) {
      newErrors.tasksCompleted = "Completed tasks list is required";
    } else if (tasksCompleted.trim().length < 10) {
      newErrors.tasksCompleted = "Please provide at least 10 characters of completed tasks";
    }

    if (!workDescription.trim()) {
      newErrors.workDescription = "Work description is required";
    } else if (workDescription.trim().length < 20) {
      newErrors.workDescription = "Please provide at least 20 characters describing your work";
    }

    if (skillsLearned.length === 0) {
      newErrors.skillsLearned = "Please add at least one skill acquired or practiced";
    }

    if (!challengesFaced.trim()) {
      newErrors.challengesFaced = "Challenges section is required (enter 'None' if none faced)";
    }

    if (!nextWeekPlan.trim()) {
      newErrors.nextWeekPlan = "Next week's plan is required";
    } else if (nextWeekPlan.trim().length < 10) {
      newErrors.nextWeekPlan = "Please provide at least 10 characters for your upcoming plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save Draft
  const handleSaveDraft = () => {
    const draftData = {
      weekNumber,
      startDate,
      endDate,
      hoursLogged,
      tasksCompleted,
      workDescription,
      skillsLearned,
      challengesFaced,
      nextWeekPlan,
      savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`sims_report_draft_wk_${weekNumber}`, JSON.stringify(draftData));
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }

    setDraftNotice(`Draft saved for Week ${weekNumber} at ${draftData.savedAt}`);
    setTimeout(() => {
      setDraftNotice(null);
    }, 4000);
  };

  // Submit Report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessBanner(null);

    const generatedId = `REP-WK-00${weekNumber}`;
    const reportData: WeeklyReport = {
      id: generatedId,
      weekNumber,
      startDate,
      endDate,
      tasksCompleted,
      workDescription,
      skillsLearned,
      challengesFaced,
      nextWeekPlan,
      submissionDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "Submitted",
      shortSummary:
        workDescription.length > 90
          ? `${workDescription.substring(0, 90)}...`
          : workDescription,
      mentorFeedbackStatus: "Pending Review",
      hoursLogged,
    };

    try {
      if (internshipId && studentId) {
        // Send to real backend API: POST /api/internships/{internship_id}/reports
        await internshipsApi.createReport(internshipId, {
          student_id: studentId,
          week_number: weekNumber,
          title: `Week ${weekNumber} Progress Report`,
          summary: `${workDescription}\n\nTasks:\n${tasksCompleted}\n\nChallenges:\n${challengesFaced}\n\nNext Plan:\n${nextWeekPlan}`,
          hours_logged: hoursLogged,
          status: "Pending Submission",
        });
      }

      // Clear draft storage
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(`sims_report_draft_wk_${weekNumber}`);
        }
      } catch {
        // Ignore
      }

      setSuccessBanner(
        `Weekly Report for Week ${weekNumber} submitted successfully! Your submission is now recorded and awaiting mentor review.`
      );
      onSubmitSuccess(reportData);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrors((prev: FormErrors) => ({
          ...prev,
          weekNumber: err.message,
        }));
      } else {
        // Graceful fallback for offline mode
        setSuccessBanner(
          `Weekly Report recorded locally for Week ${weekNumber} (Backend offline).`
        );
        onSubmitSuccess(reportData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="pb-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100 mb-1.5">
            <DocumentTextIcon className="w-3.5 h-3.5" />
            <span>Weekly Progress Submission</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Submit Weekly Internship Report
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Document tasks, technical deliverables, skills acquired, and roadblocks for mentor evaluation
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-500">Current Cohort:</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold font-mono">
            Week {weekNumber}
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start space-x-2.5">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-950">Report Submitted Successfully!</div>
              <p className="mt-0.5 leading-relaxed text-emerald-800">{successBanner}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 rounded-md hover:bg-emerald-100/60"
          >
            ✕
          </button>
        </div>
      )}

      {/* Draft Saved Toast Banner */}
      {draftNotice && (
        <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 text-xs text-indigo-900 flex items-center space-x-2.5 animate-fadeIn">
          <BookmarkIcon className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-medium">{draftNotice}</span>
        </div>
      )}

      {/* Validation Error Summary Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-start space-x-2.5">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Please correct the following fields before submitting:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-800">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* The Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Row 1: Week Number, Start Date, End Date, Hours Logged */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Week Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Week Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={12}
                value={weekNumber}
                onChange={(e) => {
                  setWeekNumber(Number(e.target.value));
                  if (errors.weekNumber) setErrors({ ...errors, weekNumber: undefined });
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 ${
                  errors.weekNumber
                    ? "border-rose-300 ring-rose-200 bg-rose-50/20"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
              />
            </div>
            {errors.weekNumber && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" /> {errors.weekNumber}
              </p>
            )}
          </div>

          {/* Week Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Week Start Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) setErrors({ ...errors, startDate: undefined });
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 ${
                  errors.startDate
                    ? "border-rose-300 ring-rose-200 bg-rose-50/20"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
              />
            </div>
            {errors.startDate && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" /> {errors.startDate}
              </p>
            )}
          </div>

          {/* Week End Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Week End Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errors.endDate) setErrors({ ...errors, endDate: undefined });
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 ${
                  errors.endDate
                    ? "border-rose-300 ring-rose-200 bg-rose-50/20"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
              />
            </div>
            {errors.endDate && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" /> {errors.endDate}
              </p>
            )}
          </div>

          {/* Hours Logged */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hours Logged
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={60}
                value={hoursLogged}
                onChange={(e) => setHoursLogged(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Target: 20 hrs / week</p>
          </div>
        </div>

        {/* Row 2: Tasks Completed */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Tasks Completed <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">List bullet points or milestone deliverables</span>
          </div>
          <textarea
            rows={3}
            value={tasksCompleted}
            onChange={(e) => {
              setTasksCompleted(e.target.value);
              if (errors.tasksCompleted) setErrors({ ...errors, tasksCompleted: undefined });
            }}
            placeholder="• Completed task 1&#10;• Completed task 2..."
            className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 ${
              errors.tasksCompleted
                ? "border-rose-300 ring-rose-200 bg-rose-50/20"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
            }`}
          />
          {errors.tasksCompleted && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircleIcon className="w-3 h-3" /> {errors.tasksCompleted}
            </p>
          )}
        </div>

        {/* Row 3: Work Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Work Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Comprehensive summary of weekly engineering activities</span>
          </div>
          <textarea
            rows={4}
            value={workDescription}
            onChange={(e) => {
              setWorkDescription(e.target.value);
              if (errors.workDescription) setErrors({ ...errors, workDescription: undefined });
            }}
            placeholder="Describe your technical contributions, implementations, architecture designs, and outcomes during the week..."
            className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 ${
              errors.workDescription
                ? "border-rose-300 ring-rose-200 bg-rose-50/20"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
            }`}
          />
          {errors.workDescription && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircleIcon className="w-3 h-3" /> {errors.workDescription}
            </p>
          )}
        </div>

        {/* Row 4: Skills Learned */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Skills Learned & Practiced <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">{skillsLearned.length} skills added</span>
          </div>

          {/* Tag Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            {skillsLearned.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center space-x-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-800"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-indigo-400 hover:text-indigo-700 font-bold ml-1"
                >
                  ✕
                </button>
              </span>
            ))}

            {skillsLearned.length === 0 && (
              <span className="text-xs text-slate-400 italic">
                No skills added yet. Add skills below or select from quick suggestions.
              </span>
            )}
          </div>

          {/* Add Skill Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill(skillInput);
                }
              }}
              placeholder="Type skill and press Enter or click Add (e.g. Distributed Caching)..."
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(skillInput)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
            >
              Add Skill
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Suggestions:</span>
            {COMMON_SKILLS.filter((s) => !skillsLearned.includes(s)).slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAddSkill(s)}
                className="text-[10px] font-medium text-slate-600 bg-white hover:bg-indigo-50 hover:text-indigo-700 px-2 py-0.5 rounded border border-slate-200 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>

          {errors.skillsLearned && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircleIcon className="w-3 h-3" /> {errors.skillsLearned}
            </p>
          )}
        </div>

        {/* Row 5: Challenges Faced */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Challenges Faced <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Technical blockers, bugs, or architectural hurdles</span>
          </div>
          <textarea
            rows={3}
            value={challengesFaced}
            onChange={(e) => {
              setChallengesFaced(e.target.value);
              if (errors.challengesFaced) setErrors({ ...errors, challengesFaced: undefined });
            }}
            placeholder="Describe challenges or blockers encountered and how you solved or plan to solve them..."
            className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 ${
              errors.challengesFaced
                ? "border-rose-300 ring-rose-200 bg-rose-50/20"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
            }`}
          />
          {errors.challengesFaced && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircleIcon className="w-3 h-3" /> {errors.challengesFaced}
            </p>
          )}
        </div>

        {/* Row 6: Next Week's Plan */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Next Week&apos;s Plan <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Proposed goals and deliverables for Week {weekNumber + 1}</span>
          </div>
          <textarea
            rows={3}
            value={nextWeekPlan}
            onChange={(e) => {
              setNextWeekPlan(e.target.value);
              if (errors.nextWeekPlan) setErrors({ ...errors, nextWeekPlan: undefined });
            }}
            placeholder="What will you work on next week? Mention target deliverables, sync meetings, or research goals..."
            className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 ${
              errors.nextWeekPlan
                ? "border-rose-300 ring-rose-200 bg-rose-50/20"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
            }`}
          />
          {errors.nextWeekPlan && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircleIcon className="w-3 h-3" /> {errors.nextWeekPlan}
            </p>
          )}
        </div>

        {/* Form Action Buttons: Submit Report & Save Draft */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center space-x-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <BookmarkIcon className="w-4 h-4 text-slate-500" />
              <span>Save Draft</span>
            </button>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Saves locally in browser
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center space-x-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25"
              }`}
            >
              <SendIcon className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting Report..." : "Submit Report"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
