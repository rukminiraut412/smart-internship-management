"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InternshipStatusCard } from "@/components/dashboard/InternshipStatusCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { TasksCompletedCard } from "@/components/dashboard/TasksCompletedCard";
import { ReportsSubmittedCard } from "@/components/dashboard/ReportsSubmittedCard";
import { SkillMatchCard } from "@/components/dashboard/SkillMatchCard";
import { AttentionStatusCard } from "@/components/dashboard/AttentionStatusCard";
import { PlaceholderView } from "@/components/dashboard/PlaceholderView";
import { StudentProfileView } from "@/components/profile/StudentProfileView";
import { InternshipRegistrationView } from "@/components/internship/InternshipRegistrationView";
import { InternshipProgressView } from "@/components/progress/InternshipProgressView";
import { WeeklyReportView } from "@/components/progress/WeeklyReportView";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  mockStudentData,
  StudentProfile,
  InternshipDetails,
  AttentionStatus,
  ReportItem,
  SkillMatchItem,
  WeeklyReport,
  ReportStatus,
} from "@/data/mockData";
import {
  authApi,
  authStorage,
  BackendInternship,
  healthApi,
  internshipsApi,
  intelligenceApi,
  studentsApi,
  UserProfile,
} from "@/lib/api";

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Connectivity & Authentication State
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Application Data State (initialized with baseline prototype defaults)
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(mockStudentData.student);
  const [internshipDetails, setInternshipDetails] = useState<InternshipDetails>(mockStudentData.internship);
  const [activeInternshipId, setActiveInternshipId] = useState<string | null>(null);
  const [attentionData, setAttentionData] = useState<AttentionStatus>(mockStudentData.attention);
  const [reportsList, setReportsList] = useState<ReportItem[]>(mockStudentData.reports);
  const [detailedReports, setDetailedReports] = useState<WeeklyReport[]>(mockStudentData.weeklyReports);
  const [skillsList, setSkillsList] = useState<SkillMatchItem[]>(mockStudentData.skills);

  const { progress, tasks } = mockStudentData;

  // 1. Check Backend Connectivity
  const checkHealth = useCallback(async () => {
    try {
      const health = await healthApi.check();
      if (health.status === "healthy") {
        setBackendConnected(true);
        return true;
      }
    } catch {
      setBackendConnected(false);
    }
    return false;
  }, []);

  // 2. Load Current User Session
  const loadUserSession = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }
    try {
      const user = await authApi.getMe();
      setCurrentUser(user);

      const studentId = user.student_id || user.id;
      try {
        const backendProfile = await studentsApi.getProfile(studentId);
        if (backendProfile) {
          setStudentProfile((prev) => ({
            ...prev,
            name: backendProfile.name || user.full_name,
            email: backendProfile.email || user.email,
            studentId: backendProfile.student_id_number || prev.studentId,
            phone: backendProfile.phone || prev.phone,
            college: backendProfile.college || prev.college,
            university: backendProfile.university || prev.university,
            department: backendProfile.department || prev.department,
            year: backendProfile.year_of_study || prev.year,
            gpa: backendProfile.gpa !== null && backendProfile.gpa !== undefined ? backendProfile.gpa : prev.gpa,
            skills: backendProfile.skills && backendProfile.skills.length > 0 ? backendProfile.skills : prev.skills,
          }));
        }
      } catch {
        setStudentProfile((prev) => ({
          ...prev,
          name: user.full_name,
          email: user.email,
        }));
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // 3. Fetch Real Backend Data
  const loadBackendData = useCallback(async () => {
    try {
      let primary: BackendInternship | null = null;

      // Check if logged-in user has registered internships
      const token = authStorage.getToken();
      if (token) {
        try {
          const me = await authApi.getMe();
          const studentId = me.student_id || me.id;
          const studentInternships = await studentsApi.getInternships(studentId);
          if (studentInternships && studentInternships.length > 0) {
            primary = studentInternships[0].internship;
          }
        } catch {
          // Token expired or student profile not yet loaded
        }
      }

      // If no student-specific internship found, fallback to general listing
      if (!primary) {
        const backendInternships = await internshipsApi.list();
        if (backendInternships && backendInternships.length > 0) {
          primary = backendInternships[0];
        }
      }

      if (primary) {
        setActiveInternshipId(primary.id);
        setInternshipDetails({
          company: primary.company_name || "CloudScale Distributed Systems",
          role: primary.title,
          mentor: "Dr. Marcus Vance",
          mentorTitle: "Staff Systems Architect",
          mentorEmail: "m.vance@cloudscale.io",
          location: primary.location || "Seattle, WA / Remote",
          term: "Fall 2026 Cohort",
          startDate: primary.start_date ? primary.start_date.split("T")[0] : "Aug 15, 2026",
          endDate: primary.end_date ? primary.end_date.split("T")[0] : "Nov 07, 2026",
          status: primary.status === "Open" ? "Active" : "Active",
          stipend: primary.stipend || "$1,800 / month",
        });

        // Fetch reports for this internship
        const backendReports = await internshipsApi.listReports(primary.id);
        if (backendReports && backendReports.length > 0) {
          const mappedReports: ReportItem[] = backendReports.map((r) => ({
            week: r.week_number,
            status: (r.status === "Approved" ? "Approved" : "Pending Submission") as "Approved" | "Pending Submission",
            hoursLogged: r.hours_logged,
            mentorScore: r.mentor_score,
            submissionDate: r.submission_date ? r.submission_date.split("T")[0] : undefined,
          }));
          setReportsList(mappedReports);

          const mappedDetailed: WeeklyReport[] = backendReports.map((r) => {
            const existingMock = mockStudentData.weeklyReports.find((m) => m.weekNumber === r.week_number);
            return {
              id: r.id,
              weekNumber: r.week_number,
              startDate: existingMock?.startDate || "2026-09-01",
              endDate: existingMock?.endDate || "2026-09-07",
              tasksCompleted: existingMock?.tasksCompleted || r.summary || "Weekly milestones completed.",
              workDescription: r.summary || existingMock?.workDescription || r.title || "Work completed.",
              skillsLearned: existingMock?.skillsLearned || ["Development", "Testing"],
              challengesFaced: existingMock?.challengesFaced || "None",
              nextWeekPlan: existingMock?.nextWeekPlan || "Continue project roadmap.",
              submissionDate: r.submission_date ? r.submission_date.split("T")[0] : (r.created_at ? r.created_at.split("T")[0] : "Recently"),
              status: (r.status === "Approved" ? "Reviewed" : "Pending Review") as ReportStatus,
              shortSummary: r.title || `Week ${r.week_number} Progress Report`,
              mentorFeedbackStatus: r.status === "Approved" ? "Reviewed" : "Pending Review",
              mentorScore: r.mentor_score,
              mentorFeedback: r.mentor_feedback,
              hoursLogged: r.hours_logged,
            };
          });
          setDetailedReports(mappedDetailed);
        }

        // Fetch Intelligence: Skill Gap
        try {
          const skillGap = await intelligenceApi.getInternshipSkillGap(primary.id);
          if (skillGap) {
            const mappedSkills: SkillMatchItem[] = [
              ...skillGap.matched_skills.map((s) => ({
                skill: s,
                studentLevel: "Advanced" as const,
                requiredLevel: "Intermediate" as const,
                matchStatus: "Met" as const,
                progressPct: 100,
              })),
              ...skillGap.missing_skills.map((s) => ({
                skill: s,
                studentLevel: "Beginner" as const,
                requiredLevel: "Intermediate" as const,
                matchStatus: "Missing" as const,
                progressPct: 40,
              })),
            ];
            if (mappedSkills.length > 0) {
              setSkillsList(mappedSkills);
            }
          }
        } catch {
          // Keep default skills if error
        }
      }

      // Fetch Intelligence: Progress Attention Evaluation
      try {
        const attRes = await intelligenceApi.evaluateAttention({
          progress_consistency: 90,
          task_completion: 85,
          report_submission: 95,
          mentor_feedback: 90,
        });
        if (attRes) {
          setAttentionData({
            status: attRes.status as "ON_TRACK" | "MONITOR" | "NEEDS_ATTENTION",
            attentionScore: Number(attRes.score),
            health: attRes.status === "ON_TRACK" ? "Healthy" : "Attention Needed",
            riskScore: Math.max(0, 100 - Number(attRes.score)),
            lastEvaluated: "Just now (Live Intelligence Engine)",
            flaggedReasons: attRes.reasons,
            reasons: attRes.reasons,
            recommendedActions: attRes.recommendations,
            recommendations: attRes.recommendations,
          });
        }
      } catch {
        // Keep default attention data if evaluation fails
      }
    } catch {
      // Backend not yet reachable
    }
  }, []);

  // Initialization Effect
  useEffect(() => {
    async function init() {
      const isHealthy = await checkHealth();
      await loadUserSession();
      if (isHealthy) {
        await loadBackendData();
      }
    }
    init();
  }, [checkHealth, loadUserSession, loadBackendData]);

  const handleActionClick = () => {
    setActiveTab("Weekly Reports");
  };

  const handleAuthSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setStudentProfile((prev) => ({
      ...prev,
      name: user.full_name,
      email: user.email,
    }));
    const studentId = user.student_id || user.id;
    try {
      const backendProfile = await studentsApi.getProfile(studentId);
      if (backendProfile) {
        setStudentProfile((prev) => ({
          ...prev,
          name: backendProfile.name || user.full_name,
          email: backendProfile.email || user.email,
          studentId: backendProfile.student_id_number || prev.studentId,
          phone: backendProfile.phone || prev.phone,
          college: backendProfile.college || prev.college,
          university: backendProfile.university || prev.university,
          department: backendProfile.department || prev.department,
          year: backendProfile.year_of_study || prev.year,
          gpa: backendProfile.gpa !== null && backendProfile.gpa !== undefined ? backendProfile.gpa : prev.gpa,
          skills: backendProfile.skills && backendProfile.skills.length > 0 ? backendProfile.skills : prev.skills,
        }));
      }
    } catch {
      // Keep basic profile
    }
    loadBackendData();
  };

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNavbar
          activeTabTitle={activeTab}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          currentUser={currentUser}
          backendConnected={backendConnected}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {activeTab === "Dashboard" && (
            <div className="space-y-6">
              {/* Header Hero */}
              <DashboardHeader
                student={studentProfile}
                internship={internshipDetails}
                onActionClick={handleActionClick}
                onNavigateTab={setActiveTab}
              />

              {/* Core 6 Cards Grid */}
              <section aria-label="Student Internship Metrics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Card 1: Internship Status */}
                  <InternshipStatusCard internship={internshipDetails} />

                  {/* Card 2: Overall Progress */}
                  <ProgressCard
                    progress={progress}
                    onNavigateToProgress={() => setActiveTab("Progress")}
                  />

                  {/* Card 3: Tasks Completed */}
                  <TasksCompletedCard tasks={tasks} />

                  {/* Card 4: Reports Submitted */}
                  <ReportsSubmittedCard
                    reports={reportsList}
                    onNavigateToReports={() => setActiveTab("Weekly Reports")}
                  />

                  {/* Card 5: Skill Match (Intelligence Module) */}
                  <SkillMatchCard skills={skillsList} />

                  {/* Card 6: Attention Status (Explainable Progress Monitoring) */}
                  <AttentionStatusCard attention={attentionData} />
                </div>
              </section>

              {/* Informational Guidance Footer */}
              <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>
                    Logged in as <strong>{studentProfile.name}</strong> ({studentProfile.studentId}) • {studentProfile.department}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("My Profile")}
                      className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Full Profile →
                    </button>
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <span className={`h-2 w-2 rounded-full ${backendConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {backendConnected ? "Live Backend API Active" : "Mock Data Active"}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "My Profile" && (
            <StudentProfileView
              initialProfile={studentProfile}
              studentId={currentUser ? (currentUser.student_id || currentUser.id) : undefined}
              onProfileUpdate={setStudentProfile}
            />
          )}

          {activeTab === "Internship Registration" && (
            <InternshipRegistrationView
              studentId={currentUser ? (currentUser.student_id || currentUser.id) : undefined}
              onRegistrationSuccess={() => {
                loadBackendData();
                setActiveTab("Dashboard");
              }}
            />
          )}

          {activeTab === "Progress" && (
            <InternshipProgressView
              internship={internshipDetails}
              progress={progress}
              tasks={tasks}
              attention={attentionData}
              timeline={mockStudentData.weeklyTimeline}
              onNavigateToWeeklyReport={() => setActiveTab("Weekly Reports")}
            />
          )}

          {activeTab === "Weekly Reports" && (
            <WeeklyReportView
              attention={attentionData}
              initialReports={detailedReports}
              initialWeek={progress.currentWeek}
              internshipId={activeInternshipId || undefined}
              studentId={currentUser ? (currentUser.student_id || currentUser.id) : undefined}
              onBackToProgress={() => setActiveTab("Progress")}
              onReportSubmitted={loadBackendData}
            />
          )}

          {activeTab !== "Dashboard" &&
            activeTab !== "My Profile" &&
            activeTab !== "Internship Registration" &&
            activeTab !== "Progress" &&
            activeTab !== "Weekly Reports" && (
              <PlaceholderView
                tabName={activeTab}
                onBackToDashboard={() => setActiveTab("Dashboard")}
              />
            )}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
