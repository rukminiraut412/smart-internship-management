"use client";

import React, { useState } from "react";
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  MapPinIcon,
  UserIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CheckIcon,
} from "@/components/common/Icons";
import {
  mockStudentData,
  InternshipDetails,
  ProgressSummary,
  TaskItem,
  AttentionStatus,
  WeeklyProgressItem,
} from "@/data/mockData";
import { WeeklyProgressTimeline } from "./WeeklyProgressTimeline";

interface InternshipProgressViewProps {
  internship?: InternshipDetails;
  progress?: ProgressSummary;
  tasks?: TaskItem[];
  attention?: AttentionStatus;
  timeline?: WeeklyProgressItem[];
  onNavigateToWeeklyReport?: (week?: number) => void;
}

export function InternshipProgressView({
  internship = mockStudentData.internship,
  progress = mockStudentData.progress,
  tasks = mockStudentData.tasks,
  timeline = mockStudentData.weeklyTimeline,
  onNavigateToWeeklyReport,
}: InternshipProgressViewProps) {
  const [taskFilter, setTaskFilter] = useState<
    "all" | "completed" | "pending"
  >("all");

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  );

  const pendingTasks = tasks.filter(
    (task) => task.status !== "Completed"
  );

  const filteredTasks =
    taskFilter === "completed"
      ? completedTasks
      : taskFilter === "pending"
      ? pendingTasks
      : tasks;

  const hoursPct =
    progress.targetHours > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (progress.hoursCompleted / progress.targetHours) * 100
            )
          )
        )
      : 0;

  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(progress.percentComplete))
  );

  return (
    <div className="space-y-6">
      {/* =========================================================
          1. INTERNSHIP HEADER
      ========================================================= */}
      <section
        aria-label="Internship Overview"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            {/* Status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {internship.status}
              </span>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                {internship.term}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                <MapPinIcon className="h-3 w-3" />
                {internship.location}
              </span>
            </div>

            {/* Role & Company */}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {internship.role}
              </h1>

              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-indigo-600">
                <BuildingOfficeIcon className="h-4 w-4" />
                {internship.company}
              </div>
            </div>

            {/* Dates & Mentor */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                {internship.startDate} — {internship.endDate}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                Mentor: {internship.mentor}
              </span>
            </div>
          </div>

          {/* Weekly Report CTA */}
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <button
              type="button"
              onClick={() =>
                onNavigateToWeeklyReport?.(progress.currentWeek)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              <DocumentTextIcon className="h-4 w-4" />
              Submit Weekly Report
              <ArrowRightIcon className="h-4 w-4" />
            </button>

            <span className="text-center text-[10px] text-slate-400 sm:text-right">
              Current cycle: Week {progress.currentWeek} of{" "}
              {progress.totalWeeks}
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. OVERALL PROGRESS
      ========================================================= */}
      <section
        aria-label="Overall Progress"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUpIcon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Overall Progress
            </h2>

            <p className="text-xs text-slate-500">
              Internship completion and logged hours
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Internship Completion */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Internship completion
              </span>

              <span className="text-sm font-bold text-indigo-600">
                {progressPct}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <p className="mt-2 text-[10px] text-slate-400">
              Week {progress.currentWeek} of {progress.totalWeeks}
            </p>
          </div>

          {/* Hours */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <ClockIcon className="h-3.5 w-3.5" />
                Logged hours
              </span>

              <span className="text-sm font-bold text-emerald-600">
                {progress.hoursCompleted}
                <span className="font-normal text-slate-400">
                  {" "}
                  / {progress.targetHours}
                </span>
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${hoursPct}%` }}
              />
            </div>

            <p className="mt-2 text-[10px] text-slate-400">
              {progress.weeklyTargetHours} hours expected per week
            </p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>
            <p className="mt-1 text-xs font-bold text-slate-800">
              {internship.status}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Weekly Target
            </p>
            <p className="mt-1 text-xs font-bold text-slate-800">
              {progress.weeklyTargetHours} hrs
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Completed
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-700">
              {completedTasks.length} tasks
            </p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Pending
            </p>
            <p className="mt-1 text-xs font-bold text-amber-700">
              {pendingTasks.length} tasks
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. TASKS & DELIVERABLES
      ========================================================= */}
      <section aria-label="Internship Tasks">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tasks & Deliverables
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Track assigned work and completion status
            </p>
          </div>

          {/* Working Filter */}
          <div className="flex w-fit items-center gap-1 rounded-xl bg-slate-100 p-1">
            {[
              {
                key: "all" as const,
                label: `All (${tasks.length})`,
              },
              {
                key: "completed" as const,
                label: `Completed (${completedTasks.length})`,
              },
              {
                key: "pending" as const,
                label: `Pending (${pendingTasks.length})`,
              },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setTaskFilter(filter.key)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  taskFilter === filter.key
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No tasks in this category
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Try selecting another filter.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const isCompleted = task.status === "Completed";
                const isInProgress = task.status === "In Progress";

                return (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-600"
                            : isInProgress
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900">
                          {task.title}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-mono text-slate-500">
                            {task.id}
                          </span>

                          <span>•</span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {isCompleted
                              ? `Completed: ${task.dueDate}`
                              : `Due: ${task.dueDate}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : isInProgress
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {task.status}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {task.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          4. WEEKLY TIMELINE
      ========================================================= */}
      <section aria-label="Weekly Progress Timeline">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Weekly Progress
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Review weekly activity and submit reports for each cycle
          </p>
        </div>

        <WeeklyProgressTimeline
          timeline={timeline}
          progress={progress}
          onSelectWeek={onNavigateToWeeklyReport}
        />
      </section>
    </div>
  );
}
