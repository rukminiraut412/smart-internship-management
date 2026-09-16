"use client";

import React, { useState, useEffect, useCallback } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InternshipStatusCard } from "@/components/dashboard/InternshipStatusCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { ReportsSubmittedCard } from "@/components/dashboard/ReportsSubmittedCard";
import { SkillMatchCard } from "@/components/dashboard/SkillMatchCard";
import { AttentionStatusCard } from "@/components/dashboard/AttentionStatusCard";

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
} from "@/data/mockData";

import {
  authApi,
  authStorage,
  healthApi,
  internshipsApi,
  intelligenceApi,
  UserProfile,
} from "@/lib/api";

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);

  const [isAuthModalOpen, setIsAuthModalOpen] =
    useState<boolean>(false);

  // Backend & authentication
  const [backendConnected, setBackendConnected] =
    useState<boolean>(false);

  const [currentUser, setCurrentUser] =
    useState<UserProfile | null>(null);

  // Application data
  const [studentProfile, setStudentProfile] =
    useState<StudentProfile>(mockStudentData.student);

  const [internshipDetails, setInternshipDetails] =
    useState<InternshipDetails>(mockStudentData.internship);

  const [activeInternshipId, setActiveInternshipId] =
    useState<string | null>(null);

  const [attentionData, setAttentionData] =
    useState<AttentionStatus>(mockStudentData.attention);

  const [reportsList, setReportsList] =
    useState<ReportItem[]>(mockStudentData.reports);

  const [skillsList, setSkillsList] =
    useState<SkillMatchItem[]>(mockStudentData.skills);

  const { progress, tasks } = mockStudentData;

  // --------------------------------------------------
  // Backend Health Check
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Load Current User
  // --------------------------------------------------

  const loadUserSession = useCallback(async () => {
    const token = authStorage.getToken();

    if (!token) {
      setCurrentUser(null);
      return;
    }

    try {
      const user = await authApi.getMe();

      setCurrentUser(user);

      setStudentProfile((prev) => ({
        ...prev,
        name: user.full_name,
        email: user.email,
      }));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // --------------------------------------------------
  // Load Backend Data
  // --------------------------------------------------

  const loadBackendData = useCallback(async () => {
    try {
      const backendInternships = await internshipsApi.list();

      if (backendInternships && backendInternships.length > 0) {
        const primary = backendInternships[0];

        setActiveInternshipId(primary.id);

        setInternshipDetails({
          company:
            primary.company_name ||
            "CloudScale Distributed Systems",

          role: primary.title,

          mentor: "Dr. Marcus Vance",

          mentorTitle: "Staff Systems Architect",

          mentorEmail: "m.vance@cloudscale.io",

          location:
            primary.location ||
            "Seattle, WA / Remote",

          term: "Fall 2026 Cohort",

          startDate: primary.start_date
            ? primary.start_date.split("T")[0]
            : "Aug 15, 2026",

          endDate: primary.end_date
            ? primary.end_date.split("T")[0]
            : "Nov 07, 2026",

          status:
            primary.status === "Open"
              ? "Active"
              : "Active",

          stipend:
            primary.stipend ||
            "$1,800 / month",
        });

        // ----------------------------------------------
        // Weekly Reports
        // ----------------------------------------------

        try {
          const backendReports =
            await internshipsApi.listReports(primary.id);

          if (
            backendReports &&
            backendReports.length > 0
          ) {
            const mappedReports: ReportItem[] =
              backendReports.map((r) => ({
                week: r.week_number,

                status:
                  r.status === "Approved"
                    ? "Approved"
                    : "Pending Submission",

                hoursLogged: r.hours_logged,

                mentorScore: r.mentor_score,

                submissionDate: r.submission_date
                  ? r.submission_date.split("T")[0]
                  : undefined,
              }));

            setReportsList(mappedReports);
          }
        } catch {
          // Keep mock reports if backend report loading fails
        }

        // ----------------------------------------------
        // Skill Gap Intelligence
        // ----------------------------------------------

        try {
          const skillGap =
            await intelligenceApi.getInternshipSkillGap(
              primary.id
            );

          if (skillGap) {
            const mappedSkills: SkillMatchItem[] = [
              ...skillGap.matched_skills.map((skill) => ({
                skill,

                studentLevel:
                  "Advanced" as const,

                requiredLevel:
                  "Intermediate" as const,

                matchStatus:
                  "Met" as const,

                progressPct: 100,
              })),

              ...skillGap.missing_skills.map((skill) => ({
                skill,

                studentLevel:
                  "Beginner" as const,

                requiredLevel:
                  "Intermediate" as const,

                matchStatus:
                  "Missing" as const,

                progressPct: 40,
              })),
            ];

            if (mappedSkills.length > 0) {
              setSkillsList(mappedSkills);
            }
          }
        } catch {
          // Keep default skill data
        }
      }

      // ----------------------------------------------
      // Progress Attention Intelligence
      // ----------------------------------------------

      try {
        const attentionResponse =
          await intelligenceApi.evaluateAttention({
            progress_consistency: 90,
            task_completion: 85,
            report_submission: 95,
            mentor_feedback: 90,
          });

        if (attentionResponse) {
          setAttentionData({
            status:
              attentionResponse.status as
                | "ON_TRACK"
                | "MONITOR"
                | "NEEDS_ATTENTION",

            attentionScore:
              Number(attentionResponse.score),

            health:
              attentionResponse.status === "ON_TRACK"
                ? "Healthy"
                : "Attention Needed",

            riskScore: Math.max(
              0,
              100 - Number(attentionResponse.score)
            ),

            lastEvaluated:
              "Just now (Live Intelligence Engine)",

            flaggedReasons:
              attentionResponse.reasons,

            reasons:
              attentionResponse.reasons,

            recommendedActions:
              attentionResponse.recommendations,

            recommendations:
              attentionResponse.recommendations,
          });
        }
      } catch {
        // Keep default attention data
      }
    } catch {
      // Backend unavailable - continue with mock data
    }
  }, []);

  // --------------------------------------------------
  // Initial Load
  // --------------------------------------------------

  useEffect(() => {
    async function initializeDashboard() {
      const isHealthy = await checkHealth();

      await loadUserSession();

      if (isHealthy) {
        await loadBackendData();
      }
    }

    initializeDashboard();
  }, [
    checkHealth,
    loadUserSession,
    loadBackendData,
  ]);

  // --------------------------------------------------
  // Navigation Helpers
  // --------------------------------------------------

  const goToProgressReports = () => {
    setActiveTab("Progress & Reports");
  };

  const goToIntelligence = () => {
    setActiveTab("Intelligence");
  };

  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);

    setStudentProfile((prev) => ({
      ...prev,
      name: user.full_name,
      email: user.email,
    }));

    loadBackendData();
  };

  const handleLogout = () => {
    authApi.logout();

    setCurrentUser(null);
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">

      {/* -------------------------------------------- */}
      {/* Sidebar */}
      {/* -------------------------------------------- */}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() =>
          setIsMobileSidebarOpen(false)
        }
      />

      {/* -------------------------------------------- */}
      {/* Main Layout */}
      {/* -------------------------------------------- */}

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}

        <TopNavbar
          activeTabTitle={activeTab}
          onOpenSidebar={() =>
            setIsMobileSidebarOpen(true)
          }
          currentUser={currentUser}
          backendConnected={backendConnected}
          onOpenAuthModal={() =>
            setIsAuthModalOpen(true)
          }
          onLogout={handleLogout}
        />

        {/* ---------------------------------------- */}
        {/* Main Content */}
        {/* ---------------------------------------- */}

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">

          {/* ====================================== */}
          {/* DASHBOARD */}
          {/* ====================================== */}

          {activeTab === "Dashboard" && (
            <div className="space-y-6">

              <DashboardHeader
                student={studentProfile}
                internship={internshipDetails}
                onActionClick={goToProgressReports}
                onNavigateTab={setActiveTab}
              />

              {/* Main Dashboard Cards */}

              <section
                aria-label="Student Internship Overview"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                  {/* Internship */}

                  <InternshipStatusCard
                    internship={internshipDetails}
                  />

                  {/* Overall Progress */}

                  <ProgressCard
                    progress={progress}
                    onNavigateToProgress={() =>
                      setActiveTab("Progress & Reports")
                    }
                  />

                  {/* Reports */}

                  <ReportsSubmittedCard
                    reports={reportsList}
                    onNavigateToReports={() =>
                      setActiveTab("Progress & Reports")
                    }
                  />

                  {/* Intelligence */}

                  <AttentionStatusCard
                    attention={attentionData}
                  />

                </div>
              </section>

              {/* Current Insight */}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Current Insight
                    </p>

                    <h2 className="mt-1 text-base font-semibold text-slate-900">
                      Internship Intelligence
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      {attentionData.reasons?.[0] ||
                        "Your internship progress is being monitored continuously."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={goToIntelligence}
                    className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View Intelligence →
                  </button>

                </div>

              </section>

              {/* Small Footer Info */}

              <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-2xs">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                  <span>
                    Logged in as{" "}
                    <strong>
                      {studentProfile.name}
                    </strong>{" "}
                    ({studentProfile.studentId}) •{" "}
                    {studentProfile.department}
                  </span>

                  <div className="flex items-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab("My Profile")
                      }
                      className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Profile →
                    </button>

                    <span className="inline-flex items-center gap-1 text-slate-400">

                      <span
                        className={`h-2 w-2 rounded-full ${
                          backendConnected
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />

                      {backendConnected
                        ? "Live Backend"
                        : "Demo Data"}

                    </span>

                  </div>

                </div>

              </section>

            </div>
          )}

          {/* ====================================== */}
          {/* MY INTERNSHIP */}
          {/* ====================================== */}

          {activeTab === "My Internship" && (
            <div className="space-y-6">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Internship
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  My Internship
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View your internship details and registration information.
                </p>
              </div>

              <InternshipStatusCard
                internship={internshipDetails}
              />

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">

                <div className="mb-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Internship Registration
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Register or update your internship details.
                  </p>
                </div>

                <InternshipRegistrationView />

              </section>

            </div>
          )}

          {/* ====================================== */}
          {/* PROGRESS & REPORTS */}
          {/* ====================================== */}

          {activeTab === "Progress & Reports" && (
            <div className="space-y-6">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Monitoring
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  Progress & Reports
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Track internship progress and submit weekly reports.
                </p>
              </div>

              {/* Progress */}

              <InternshipProgressView
                internship={internshipDetails}
                progress={progress}
                tasks={tasks}
                attention={attentionData}
                timeline={mockStudentData.weeklyTimeline}
                onNavigateToWeeklyReport={() =>
                  setActiveTab("Progress & Reports")
                }
              />

              {/* Weekly Reports */}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">

                <div className="mb-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Weekly Reports
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Submit your weekly progress and view report history.
                  </p>
                </div>

                <WeeklyReportView
                  attention={attentionData}
                  initialReports={
                    mockStudentData.weeklyReports
                  }
                  initialWeek={progress.currentWeek}
                  internshipId={
                    activeInternshipId || undefined
                  }
                  studentId={
                    currentUser
                      ? currentUser.id
                      : undefined
                  }
                  onBackToProgress={() =>
                    setActiveTab("Progress & Reports")
                  }
                />

              </section>

            </div>
          )}

          {/* ====================================== */}
          {/* INTELLIGENCE */}
          {/* ====================================== */}

          {activeTab === "Intelligence" && (
            <div className="space-y-6">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Intelligence Layer
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  Internship Intelligence
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Understand your progress status and identify skills to improve.
                </p>
              </div>

              {/* ---------------------------------- */}
              {/* Section 1: Progress Attention */}
              {/* ---------------------------------- */}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">

                <div className="mb-5">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    01
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Progress Attention
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Continuous analysis of internship progress to identify where attention may be needed.
                  </p>

                </div>

                <AttentionStatusCard
                  attention={attentionData}
                />

              </section>

              {/* ---------------------------------- */}
              {/* Section 2: Skill Gap */}
              {/* ---------------------------------- */}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">

                <div className="mb-5">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    02
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Skill Gap Analysis
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Compare your current skills with the skills required for the internship.
                  </p>

                </div>

                <SkillMatchCard
                  skills={skillsList}
                />

              </section>

            </div>
          )}

          {/* ====================================== */}
          {/* MY PROFILE */}
          {/* ====================================== */}

          {activeTab === "My Profile" && (
            <StudentProfileView
              initialProfile={studentProfile}
              onProfileUpdate={setStudentProfile}
            />
          )}

        </main>

      </div>

      {/* ========================================== */}
      {/* AUTH MODAL */}
      {/* ========================================== */}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() =>
          setIsAuthModalOpen(false)
        }
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
