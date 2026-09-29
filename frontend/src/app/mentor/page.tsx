"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  mentorsApi,
  MentorProfile,
  MentorInternItem,
  BackendProgressReport,
  EvaluationItem,
  TaskItem,
} from "@/lib/api";

// Mentor Views
import { MentorDashboardView } from "@/components/mentor/MentorDashboardView";
import { MentorInternsView } from "@/components/mentor/MentorInternsView";
import { MentorWeeklyReportsView } from "@/components/mentor/MentorWeeklyReportsView";
import { MentorTasksView } from "@/components/mentor/MentorTasksView";
import { MentorEvaluationsView } from "@/components/mentor/MentorEvaluationsView";
import { MentorProfileView } from "@/components/mentor/MentorProfileView";

export default function MentorPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Live state fetched from API
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [interns, setInterns] = useState<MentorInternItem[]>([]);
  const [reports, setReports] = useState<BackendProgressReport[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);

  // Selected intern for evaluation modal
  const [evalStudentId, setEvalStudentId] = useState<string | undefined>(undefined);
  const [evalInternshipId, setEvalInternshipId] = useState<string | undefined>(undefined);

  const loadMentorData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // 1. Fetch Profile
      try {
        const p = await mentorsApi.getProfile();
        setProfile(p);
      } catch {
        if (user) {
          setProfile({
            id: user.id,
            user_id: user.id,
            name: user.full_name,
            email: user.email,
            company_name: "",
            job_title: "Industry Mentor",
            department: "",
            created_at: new Date().toISOString(),
          });
        }
      }

      // 2. Fetch Interns
      try {
        const internList = await mentorsApi.getInterns();
        setInterns(Array.isArray(internList) ? internList : []);
      } catch {
        setInterns([]);
      }

      // 3. Fetch Reports
      try {
        const reportList = await mentorsApi.getReports();
        setReports(Array.isArray(reportList) ? reportList : []);
      } catch {
        setReports([]);
      }

      // 4. Fetch Tasks
      try {
        const taskList = await mentorsApi.getTasks();
        setTasks(Array.isArray(taskList) ? taskList : []);
      } catch {
        setTasks([]);
      }

      // 5. Fetch Evaluations
      try {
        const evalList = await mentorsApi.getEvaluations();
        setEvaluations(Array.isArray(evalList) ? evalList : []);
      } catch {
        setEvaluations([]);
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load mentor workspace.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMentorData();
  }, [loadMentorData]);

  const handleOpenEvaluationModal = (studentId: string, internshipId: string) => {
    setEvalStudentId(studentId);
    setEvalInternshipId(internshipId);
    setActiveTab("Evaluations");
  };

  const handleOpenReviewReport = () => {
    setActiveTab("Weekly Reports");
  };

  return (
    <ProtectedRoute allowedRoles={["mentor"]}>
      <DashboardLayout
        role="mentor"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="Industry Mentor Workspace"
        subtitle="Supervise student cohorts, review milestone submissions, and assess performance"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="mt-4 text-xs font-semibold text-slate-400">Loading mentor cohort data...</p>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800">
            <p className="font-bold text-sm">Failed to connect to mentor services</p>
            <p className="mt-1 text-slate-600">{loadError}</p>
            <button
              onClick={loadMentorData}
              className="mt-4 px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "Dashboard" && (
              <MentorDashboardView
                profile={profile}
                interns={interns}
                reports={reports}
                onNavigateTab={setActiveTab}
                onOpenReviewReport={handleOpenReviewReport}
              />
            )}

            {activeTab === "My Interns" && (
              <MentorInternsView
                interns={interns}
                reports={reports}
                onReportReviewed={loadMentorData}
                onOpenEvaluationModal={handleOpenEvaluationModal}
              />
            )}

            {activeTab === "Weekly Reports" && (
              <MentorWeeklyReportsView
                reports={reports}
                onReportReviewed={loadMentorData}
              />
            )}

            {activeTab === "Tasks" && (
              <MentorTasksView
                tasks={tasks}
                interns={interns}
                onTaskCreated={loadMentorData}
              />
            )}

            {activeTab === "Evaluations" && (
              <MentorEvaluationsView
                evaluations={evaluations}
                interns={interns}
                onEvaluationCreated={loadMentorData}
                presetStudentId={evalStudentId}
                presetInternshipId={evalInternshipId}
              />
            )}

            {activeTab === "My Profile" && (
              <MentorProfileView
                initialProfile={profile}
                onProfileUpdated={(updated) => setProfile(updated)}
              />
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
