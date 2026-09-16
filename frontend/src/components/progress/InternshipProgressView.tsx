"use client";

import React, { useState } from "react";
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  ClipboardCheckIcon,
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
import { AttentionStatusSection } from "./AttentionStatusSection";
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
  attention = mockStudentData.attention,
  timeline = mockStudentData.weeklyTimeline,
  onNavigateToWeeklyReport,
}: InternshipProgressViewProps) {
  const [taskFilter, setTaskFilter] = useState<"all" | "completed" | "pending">("all");

  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "completed") return t.status === "Completed";
    if (taskFilter === "pending") return t.status !== "Completed";
    return true;
  });

  const hoursPct = Math.min(
    100,
    Math.round((progress.hoursCompleted / progress.targetHours) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Card: Internship Title, Company, Dates & Status */}
      <section
        aria-label="Internship Overview"
        className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            {/* Live Status & Cohort Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Status: {internship.status}</span>
              </span>
              <span className="inline-flex items-center space-x-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-xs border border-white/10">
                <span>{internship.term}</span>
              </span>
              <span className="inline-flex items-center space-x-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-xs border border-white/10">
                <MapPinIcon className="w-3.5 h-3.5" />
                <span>{internship.location}</span>
              </span>
            </div>

            {/* Title & Company Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {internship.role}
              </h1>
              <div className="flex items-center space-x-2 text-sm sm:text-base text-indigo-200 mt-1 font-medium">
                <BuildingOfficeIcon className="w-4 h-4" />
                <span>{internship.company}</span>
              </div>
            </div>

            {/* Date Range & Mentor Bio */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                <span>
                  <strong>Start:</strong> {internship.startDate} — <strong>End:</strong>{" "}
                  {internship.endDate}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span>
                  <strong>Mentor:</strong> {internship.mentor} ({internship.mentorTitle})
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 lg:items-end">
            <button
              type="button"
              onClick={() => onNavigateToWeeklyReport?.(progress.currentWeek)}
              className="inline-flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:shadow-emerald-500/25 cursor-pointer"
            >
              <DocumentTextIcon className="w-4 h-4" />
              <span>Submit Weekly Report</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            <div className="text-right text-[11px] text-slate-400">
              Current cycle: Week {progress.currentWeek} of {progress.totalWeeks}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Overall Progress Percentage & Core Metrics Card */}
      <section
        aria-label="Overall Progress Summary"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TrendingUpIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Overall Internship Progress
              </h2>
              <p className="text-xs text-slate-500">
                Term completion rate, milestone cadence, and accumulated hours
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Progress Score
              </div>
              <div className="text-2xl font-black text-indigo-600">
                {progress.percentComplete}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bars & Timeline Metrics */}
        <div className="mt-6 space-y-5">
          {/* Main Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-indigo-600" />
                Internship Completion Timeline ({progress.currentWeek} of {progress.totalWeeks} Weeks)
              </span>
              <span className="text-indigo-600 font-extrabold">{progress.percentComplete}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
          </div>

          {/* Secondary Hours Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <BriefcaseIcon className="w-4 h-4 text-emerald-600" />
                Logged Hours Cadence ({progress.hoursCompleted} of {progress.targetHours} Target Hours)
              </span>
              <span className="text-emerald-600 font-extrabold">{hoursPct}% of Hours Target</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-700"
                style={{ width: `${hoursPct}%` }}
              />
            </div>
          </div>

          {/* Metric Badges Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Status
              </span>
              <div className="mt-1 text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {internship.status}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Weekly Target
              </span>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {progress.weeklyTargetHours} hrs / week
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Completed Tasks
              </span>
              <div className="mt-1 text-sm font-bold text-emerald-600">
                {completedTasks.length} Done
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pending Tasks
              </span>
              <div className="mt-1 text-sm font-bold text-amber-600">
                {pendingTasks.length} Remaining
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Task Management Section: Completed Tasks & Pending Tasks */}
      <section aria-label="Internship Tasks Overview" className="space-y-4">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Internship Tasks & Deliverables
            </h2>
            <p className="text-xs text-slate-500">
              Track assigned milestone deliverables, completion status, and upcoming deadlines
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTaskFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                taskFilter === "all"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setTaskFilter("completed")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                taskFilter === "completed"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Completed ({completedTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setTaskFilter("pending")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                taskFilter === "pending"
                  ? "bg-white text-amber-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({pendingTasks.length})
            </button>
          </div>
        </div>

        {/* Dual Cards Grid for Completed vs Pending Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Completed Tasks Column */}
          <div className="rounded-2xl border border-emerald-100 bg-linear-to-b from-emerald-50/20 to-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100/80 mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Completed Tasks</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {completedTasks.length} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5 h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckIcon className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {task.title}
                        </div>
                        <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-400">
                          <span className="font-mono font-medium text-slate-500">{task.id}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 text-slate-400" />
                            Completed: {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {task.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks Column */}
          <div className="rounded-2xl border border-amber-100 bg-linear-to-b from-amber-50/20 to-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100/80 mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <ClockIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Pending & In-Progress Tasks</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {pendingTasks.length} Action Items
              </span>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.map((task) => {
                const isInProgress = task.status === "In Progress";
                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-3.5 shadow-2xs transition-colors ${
                      isInProgress
                        ? "border-indigo-200 bg-indigo-50/20"
                        : "border-slate-200/80 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                            isInProgress
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-snug">
                            {task.title}
                          </div>
                          <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-400">
                            <span className="font-mono font-medium text-slate-500">{task.id}</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3 text-slate-400" />
                              Target Due: {task.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            isInProgress
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {task.status}
                        </span>
                        <span className="text-[10px] text-slate-400">{task.category}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Attention Status Section (Item 4 in Task requirement) */}
      <AttentionStatusSection
        attention={attention}
        title="Student Attention & Health Status"
      />

      {/* 5. Weekly Progress Summary Timeline */}
      <WeeklyProgressTimeline
        timeline={timeline}
        progress={progress}
        onSelectWeek={onNavigateToWeeklyReport}
      />
    </div>
  );
}
