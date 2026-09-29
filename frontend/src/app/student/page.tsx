"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  studentsApi,
  internshipsApi,
  intelligenceApi,
  BackendInternship,
  BackendProgressReport,
} from "@/lib/api";
import {
  StudentProfile,
  InternshipDetails,
  ProgressSummary,
  TaskItem,
  AttentionStatus,
  SkillMatchItem,
} from "@/data/mockData";

// Student Views
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CurrentInsightSection } from "@/components/dashboard/CurrentInsightSection";
import { InternshipStatusCard } from "@/components/dashboard/InternshipStatusCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { TasksCompletedCard } from "@/components/dashboard/TasksCompletedCard";
import { ReportsSubmittedCard } from "@/components/dashboard/ReportsSubmittedCard";
import { SkillMatchCard } from "@/components/dashboard/SkillMatchCard";
import { MyInternshipView } from "@/components/internship/MyInternshipView";
import { ProgressAndReportsView } from "@/components/progress/ProgressAndReportsView";
import { IntelligenceView } from "@/components/intelligence/IntelligenceView";
import { StudentProfileView } from "@/components/profile/StudentProfileView";

export default function StudentPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Live state fetched from API
  const [profile, setProfile] = useState<StudentProfile>({
    name: user?.full_name || "",
    studentId: "",
    email: user?.email || "",
    phone: "",
    college: "",
    university: "",
    department: "",
    year: "",
    gpa: 0,
    avatarInitials: (user?.full_name || "ST").slice(0, 2).toUpperCase(),
    skills: [],
    resume: {
      fileName: "",
      status: "Pending Verification",
      uploadDate: "",
      fileSize: "",
    },
  });

  const [activeInternship, setActiveInternship] = useState<InternshipDetails>({
    company: "",
    role: "",
    mentor: "",
    mentorTitle: "",
    mentorEmail: "",
    location: "",
    term: "",
    startDate: "",
    endDate: "",
    status: "Pending",
    stipend: "",
  });

  const [activeInternshipId, setActiveInternshipId] = useState<string | null>(null);

  const [progress, setProgress] = useState<ProgressSummary>({
    currentWeek: 0,
    totalWeeks: 12,
    percentComplete: 0,
    hoursCompleted: 0,
    targetHours: 240,
    weeklyTargetHours: 20,
  });

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [reports, setReports] = useState<BackendProgressReport[]>([]);
  const [attention, setAttention] = useState<AttentionStatus>({
    health: "Healthy",
    status: "ON_TRACK",
    attentionScore: 100,
    riskScore: 0,
    lastEvaluated: new Date().toISOString(),
    flaggedReasons: [],
    reasons: [],
    recommendedActions: [],
    recommendations: [],
  });
  const [skills, setSkills] = useState<SkillMatchItem[]>([]);

  // Fetch real data from API
  const loadPortalData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      // 1. Fetch Student Profile
      try {
        const studentRes = await studentsApi.getProfile(user.id);
        if (studentRes) {
          setProfile({
            name: studentRes.name || user.full_name,
            studentId: studentRes.student_id_number || "",
            email: studentRes.email || user.email,
            phone: studentRes.phone || "",
            college: studentRes.college || "",
            university: studentRes.university || "",
            department: studentRes.department || "",
            year: studentRes.year_of_study || "",
            gpa: studentRes.gpa ?? 0,
            avatarInitials: (studentRes.name || user.full_name || "ST")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            skills: studentRes.skills || [],
            resume: {
              fileName: studentRes.resume_url?.split("/").pop() || "",
              status: "Verified & Active",
              uploadDate: studentRes.created_at ? studentRes.created_at.split("T")[0] : "",
              fileSize: "",
            },
          });
        }
      } catch {
        // Fallback to user auth profile
      }

      // 2. Fetch Student Internships
      let currentInternshipId: string | null = null;
      try {
        const internshipsList = await studentsApi.getInternships(user.id);
        if (internshipsList && internshipsList.length > 0) {
          const first = internshipsList[0];
          const intern = first.internship;
          currentInternshipId = intern.id;
          setActiveInternshipId(intern.id);

          setActiveInternship({
            company: intern.company_name || "",
            role: intern.title || "",
            mentor: intern.mentor_name || "",
            mentorTitle: "Industry Mentor",
            mentorEmail: intern.mentor_email || "",
            location: intern.location || "",
            term: intern.domain || "Academic Placement",
            startDate: intern.start_date ? intern.start_date.split("T")[0] : "",
            endDate: intern.end_date ? intern.end_date.split("T")[0] : "",
            status: first.application_status === "Approved" ? "Active" : "Pending",
            stipend: intern.stipend || "",
          });
        }
      } catch {
        // No registered internships yet
      }

      // 3. Fetch Reports & Calculate Progress if internship exists
      if (currentInternshipId) {
        try {
          const reportList = await internshipsApi.listReports(currentInternshipId, user.id);
          if (Array.isArray(reportList)) {
            setReports(reportList);
            const totalHours = reportList.reduce((sum, r) => sum + (r.hours_logged || 0), 0);
            const weeksSubmitted = reportList.length;
            const targetTotalHours = 240;
            const pct = Math.min(100, Math.round((totalHours / targetTotalHours) * 100));

            setProgress({
              currentWeek: weeksSubmitted,
              totalWeeks: 12,
              percentComplete: pct,
              hoursCompleted: totalHours,
              targetHours: targetTotalHours,
              weeklyTargetHours: 20,
            });
          }
        } catch {
          // No reports
        }

        // 4. Fetch Intelligence Attention Status
        try {
          const attentionRes = await intelligenceApi.getStudentAttention(user.id);
          if (attentionRes) {
            setAttention({
              health: attentionRes.status === "ON_TRACK" ? "Healthy" : attentionRes.status === "MONITOR" ? "Attention Needed" : "Critical Risk",
              status: (attentionRes.status as "ON_TRACK" | "MONITOR" | "NEEDS_ATTENTION") || "ON_TRACK",
              attentionScore: attentionRes.score ?? 100,
              riskScore: 100 - (attentionRes.score ?? 100),
              lastEvaluated: new Date().toISOString(),
              flaggedReasons: attentionRes.reasons || [],
              reasons: attentionRes.reasons || [],
              recommendedActions: attentionRes.recommendations || [],
              recommendations: attentionRes.recommendations || [],
            });
          }
        } catch {
          // Keep defaults
        }

        // 5. Fetch Skill Gap Intelligence
        try {
          const skillRes = await intelligenceApi.getInternshipSkillGap(currentInternshipId, user.id);
          if (skillRes) {
            const mappedSkills: SkillMatchItem[] = [
              ...(skillRes.matched_skills || []).map((s) => ({
                skill: s,
                studentLevel: "Advanced" as const,
                requiredLevel: "Intermediate" as const,
                matchStatus: "Met" as const,
                progressPct: 100,
              })),
              ...(skillRes.missing_skills || []).map((s) => ({
                skill: s,
                studentLevel: "Beginner" as const,
                requiredLevel: "Intermediate" as const,
                matchStatus: "Missing" as const,
                progressPct: 30,
              })),
            ];
            setSkills(mappedSkills);
          }
        } catch {
          // Keep empty skills
        }
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load portal data.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const handleRegistrationSuccess = (internship: BackendInternship) => {
    setActiveInternship({
      company: internship.company_name || "",
      role: internship.title || "",
      mentor: internship.mentor_name || "",
      mentorTitle: "Industry Mentor",
      mentorEmail: internship.mentor_email || "",
      location: internship.location || "",
      term: internship.domain || "Academic Placement",
      startDate: internship.start_date ? internship.start_date.split("T")[0] : "",
      endDate: internship.end_date ? internship.end_date.split("T")[0] : "",
      status: "Pending",
      stipend: internship.stipend || "",
    });
    setActiveInternshipId(internship.id);
    loadPortalData();
  };

  const reportItems = reports.map((r) => ({
    week: r.week_number,
    status: (r.status as "Approved" | "Under Review" | "Pending Submission") || "Under Review",
    submissionDate: r.submission_date ? r.submission_date.split("T")[0] : undefined,
    hoursLogged: r.hours_logged,
    mentorScore: r.mentor_score,
  }));

  const adaptedWeeklyReports = reports.map((r) => ({
    id: r.id,
    weekNumber: r.week_number,
    startDate: "",
    endDate: "",
    hoursLogged: r.hours_logged,
    status: (r.status === "Approved" ? "Reviewed" : "Submitted") as "Submitted" | "Pending Review" | "Reviewed",
    shortSummary: r.title || `Week ${r.week_number} Report`,
    mentorFeedbackStatus: r.status,
    tasksCompleted: r.title || `Week ${r.week_number} Milestones`,
    workDescription: r.summary || "",
    skillsLearned: [],
    challengesFaced: "",
    nextWeekPlan: "",
    submissionDate: r.submission_date ? r.submission_date.split("T")[0] : "",
    mentorFeedback: r.mentor_feedback,
    mentorScore: r.mentor_score,
  }));


  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <DashboardLayout
        role="student"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="Student Portal"
        subtitle="Manage your internship placement, weekly reporting, and skill progression"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="mt-4 text-xs font-semibold text-slate-400">Loading student workspace...</p>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800">
            <p className="font-bold text-sm">Failed to connect to monitoring service</p>
            <p className="mt-1 text-slate-600">{loadError}</p>
            <button
              onClick={loadPortalData}
              className="mt-4 px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "Dashboard" && (
              <div className="space-y-6">
                <DashboardHeader
                  student={profile}
                  internship={activeInternship}
                  onActionClick={() => setActiveTab("Progress & Reports")}
                  onNavigateTab={setActiveTab}
                />

                <CurrentInsightSection
                  attention={attention}
                  onNavigateToIntelligence={() => setActiveTab("Intelligence")}
                />

                {/* Dashboard Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <InternshipStatusCard
                    internship={activeInternship}
                    onNavigateToInternship={() => setActiveTab("My Internship")}
                  />

                  <ProgressCard
                    progress={progress}
                    onNavigateToProgress={() => setActiveTab("Progress & Reports")}
                  />

                  <ReportsSubmittedCard
                    reports={reportItems}
                    onNavigateToReports={() => setActiveTab("Progress & Reports")}
                  />

                  <div className="lg:col-span-2">
                    <SkillMatchCard skills={skills} />
                  </div>

                  <TasksCompletedCard tasks={tasks} />
                </div>
              </div>
            )}

            {activeTab === "My Internship" && (
              <MyInternshipView
                internship={activeInternship}
                studentId={user?.id}
                onRegistrationSuccess={handleRegistrationSuccess}
              />
            )}

            {activeTab === "Progress & Reports" && (
              <ProgressAndReportsView
                progress={progress}
                tasks={tasks}
                reports={adaptedWeeklyReports}
                internshipId={activeInternshipId || undefined}
                studentId={user?.id}
                onReportSubmitted={loadPortalData}
              />
            )}

            {activeTab === "Intelligence" && (
              <IntelligenceView attention={attention} skills={skills} />
            )}

            {activeTab === "My Profile" && (
              <StudentProfileView
                initialProfile={profile}
                studentId={user?.id}
                onProfileUpdate={(updated) => setProfile(updated)}
              />
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
