"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { AuthModal } from "@/components/auth/AuthModal";

// Student Portal Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InternshipStatusCard } from "@/components/dashboard/InternshipStatusCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { ReportsSubmittedCard } from "@/components/dashboard/ReportsSubmittedCard";
import { InternshipIntelligenceCard } from "@/components/dashboard/InternshipIntelligenceCard";
import { CurrentInsightSection } from "@/components/dashboard/CurrentInsightSection";
import { MyInternshipView } from "@/components/internship/MyInternshipView";
import { ProgressAndReportsView } from "@/components/progress/ProgressAndReportsView";
import { IntelligenceView } from "@/components/intelligence/IntelligenceView";
import { StudentProfileView } from "@/components/profile/StudentProfileView";

// Mentor Portal Components
import { MentorDashboardView } from "@/components/mentor/MentorDashboardView";
import { MentorInternsView } from "@/components/mentor/MentorInternsView";
import { MentorWeeklyReportsView } from "@/components/mentor/MentorWeeklyReportsView";
import { MentorTasksView } from "@/components/mentor/MentorTasksView";
import { MentorEvaluationsView } from "@/components/mentor/MentorEvaluationsView";
import { MentorProfileView } from "@/components/mentor/MentorProfileView";

// Admin Portal Components
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import { AdminApplicationsView } from "@/components/admin/AdminApplicationsView";
import { AdminMentorsView } from "@/components/admin/AdminMentorsView";
import { AdminStudentsView } from "@/components/admin/AdminStudentsView";
import { AdminInternshipsView } from "@/components/admin/AdminInternshipsView";
import { AdminReportsAlertsView } from "@/components/admin/AdminReportsAlertsView";
import { AdminProfileView } from "@/components/admin/AdminProfileView";

// Data & APIs
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
  adminApi,
  AdminApplicationItem,
  AdminInternshipItem,
  AdminMentorItem,
  AdminReportAlertItem,
  AdminStats,
  AdminStudentItem,
  authApi,
  authStorage,
  BackendInternship,
  BackendProgressReport,
  EvaluationItem,
  healthApi,
  intelligenceApi,
  internshipsApi,
  MentorInternItem,
  MentorProfile,
  mentorsApi,
  studentsApi,
  TaskItem,
  UserProfile,
} from "@/lib/api";

export default function SmartInternshipApp() {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Connectivity & Authentication State
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Student State
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(mockStudentData.student);
  const [internshipDetails, setInternshipDetails] = useState<InternshipDetails>(mockStudentData.internship);
  const [activeInternshipId, setActiveInternshipId] = useState<string | null>(null);
  const [attentionData, setAttentionData] = useState<AttentionStatus>(mockStudentData.attention);
  const [reportsList, setReportsList] = useState<ReportItem[]>(mockStudentData.reports);
  const [detailedReports, setDetailedReports] = useState<WeeklyReport[]>(mockStudentData.weeklyReports);
  const [skillsList, setSkillsList] = useState<SkillMatchItem[]>(mockStudentData.skills);
  const { progress, tasks } = mockStudentData;

  // Mentor State
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [mentorInterns, setMentorInterns] = useState<MentorInternItem[]>([]);
  const [allReports, setAllReports] = useState<BackendProgressReport[]>([]);
  const [mentorTasks, setMentorTasks] = useState<TaskItem[]>([]);
  const [mentorEvaluations, setMentorEvaluations] = useState<EvaluationItem[]>([]);
  const [evalPresetStudentId, setEvalPresetStudentId] = useState<string | undefined>(undefined);
  const [evalPresetInternshipId, setEvalPresetInternshipId] = useState<string | undefined>(undefined);

  // Admin State
  const [adminStats, setAdminStats] = useState<AdminStats>({
    total_students: 2,
    active_internships: 1,
    total_companies: 1,
    total_mentors: 1,
    pending_applications: 0,
    reports_pending_review: 1,
    students_needing_attention: 1,
    completed_internships: 0,
  });
  const [adminApplications, setAdminApplications] = useState<AdminApplicationItem[]>([]);
  const [adminMentors, setAdminMentors] = useState<AdminMentorItem[]>([]);
  const [adminStudents, setAdminStudents] = useState<AdminStudentItem[]>([]);
  const [adminInternships, setAdminInternships] = useState<AdminInternshipItem[]>([]);
  const [adminReportsAlerts, setAdminReportsAlerts] = useState<AdminReportAlertItem[]>([]);

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

  // 3. Load Student Data
  const loadStudentData = useCallback(async () => {
    try {
      let primary: BackendInternship | null = null;
      const token = authStorage.getToken();

      if (token) {
        try {
          const me = await authApi.getMe();
          const studentId = me.student_id || me.id;
          const backendProfile = await studentsApi.getProfile(studentId);
          if (backendProfile) {
            setStudentProfile((prev) => ({
              ...prev,
              name: backendProfile.name || me.full_name,
              email: backendProfile.email || me.email,
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

          const studentInternships = await studentsApi.getInternships(studentId);
          if (studentInternships && studentInternships.length > 0) {
            primary = studentInternships[0].internship;
          }
        } catch {
          // Keep defaults
        }
      }

      if (!primary) {
        const backendInternships = await internshipsApi.list();
        if (backendInternships && backendInternships.length > 0) {
          primary = backendInternships[0];
        }
      }

      if (primary) {
        setActiveInternshipId(primary.id);

        let mentorName = "Dr. Marcus Vance";
        let mentorEmail = "m.vance@cloudscale.io";
        let mentorTitle = "Staff Systems Architect";

        if (primary.description) {
          const supervisorMatch = primary.description.match(/Supervisor:\s*([^|\]]+)/);
          if (supervisorMatch) {
            mentorName = supervisorMatch[1].trim();
            mentorTitle = "Host Organization Supervisor";
          }
          const emailMatch = primary.description.match(/Email:\s*([^|\]]+)/);
          if (emailMatch) {
            mentorEmail = emailMatch[1].trim();
          }
        }

        setInternshipDetails({
          company: primary.company_name || "CloudScale Distributed Systems",
          role: primary.title,
          mentor: mentorName,
          mentorTitle: mentorTitle,
          mentorEmail: mentorEmail,
          location: primary.location || "Seattle, WA / Remote",
          term: "Fall 2026 Cohort",
          startDate: primary.start_date ? primary.start_date.split("T")[0] : "Aug 15, 2026",
          endDate: primary.end_date ? primary.end_date.split("T")[0] : "Nov 07, 2026",
          status: "Active",
          stipend: primary.stipend || "$1,800 / month",
        });

        // Reports
        const backendReports = await internshipsApi.listReports(primary.id);
        if (backendReports && backendReports.length > 0) {
          setAllReports(backendReports);

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

        // Skill Gap
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
          // Keep defaults
        }
      }

      // Attention evaluation
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
        // Keep defaults
      }
    } catch {
      // Backend not reachable
    }
  }, []);

  // 4. Load Mentor Data
  const loadMentorData = useCallback(async () => {
    try {
      const profile = await mentorsApi.getMe();
      setMentorProfile(profile);

      const mentorId = profile.id || profile.user_id;
      const interns = await mentorsApi.getInterns(mentorId);
      setMentorInterns(interns);

      // Fetch reports from primary internship
      if (activeInternshipId) {
        const reps = await internshipsApi.listReports(activeInternshipId);
        setAllReports(reps);
      } else {
        const inList = await internshipsApi.list();
        if (inList.length > 0) {
          const reps = await internshipsApi.listReports(inList[0].id);
          setAllReports(reps);
        }
      }

      const tasksList = await mentorsApi.getTasks(mentorId);
      setMentorTasks(tasksList);

      const evals = await mentorsApi.getEvaluations(mentorId);
      setMentorEvaluations(evals);
    } catch {
      // Keep baseline
    }
  }, [activeInternshipId]);

  // 5. Load Admin Data
  const loadAdminData = useCallback(async () => {
    try {
      const stats = await adminApi.getStats();
      setAdminStats(stats);

      const apps = await adminApi.getApplications();
      setAdminApplications(apps);

      const mentors = await adminApi.getMentors();
      setAdminMentors(mentors);

      const students = await adminApi.getStudents();
      setAdminStudents(students);

      const internships = await adminApi.getInternships();
      setAdminInternships(internships);

      const reportsAlerts = await adminApi.getReportsAndAlerts();
      setAdminReportsAlerts(reportsAlerts);
    } catch {
      // Keep baseline
    }
  }, []);

  // Initialization Effect
  useEffect(() => {
    async function init() {
      const isHealthy = await checkHealth();
      const token = authStorage.getToken();
      if (token) {
        try {
          const user = await authApi.getMe();
          setCurrentUser(user);
          if (isHealthy) {
            if (user.role === "mentor") {
              loadMentorData();
            } else if (user.role === "admin") {
              loadAdminData();
            } else {
              loadStudentData();
            }
          }
        } catch {
          authStorage.removeToken();
          setCurrentUser(null);
          if (isHealthy) loadStudentData();
        }
      } else {
        if (isHealthy) loadStudentData();
      }
    }
    init();
  }, [checkHealth, loadMentorData, loadAdminData, loadStudentData]);

  const handleAuthSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab("Dashboard");

    if (user.role === "mentor") {
      await loadMentorData();
    } else if (user.role === "admin") {
      await loadAdminData();
    } else {
      await loadStudentData();
    }
  };

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    setActiveTab("Dashboard");
    loadStudentData();
  };

  const currentRole = currentUser?.role || "student";
  const validTabs =
    currentRole === "mentor"
      ? ["Dashboard", "My Interns", "Weekly Reports", "Tasks", "Evaluations", "My Profile"]
      : currentRole === "admin"
      ? ["Dashboard", "Students", "Internships", "Applications", "Mentors", "Reports & Alerts", "Profile"]
      : ["Dashboard", "My Internship", "Progress & Reports", "Intelligence", "My Profile"];

  const currentTab = validTabs.includes(activeTab) ? activeTab : "Dashboard";

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={currentTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        role={currentRole}
        currentUser={currentUser}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNavbar
          activeTabTitle={currentTab}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          currentUser={currentUser}
          backendConnected={backendConnected}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {/* ============================================================ */}
          {/* STUDENT PORTAL SCREENS */}
          {/* ============================================================ */}
          {currentRole === "student" && (
            <>
              {currentTab === "Dashboard" && (
                <div className="space-y-5">
                  <DashboardHeader
                    student={studentProfile}
                    internship={internshipDetails}
                    onActionClick={() => setActiveTab("Progress & Reports")}
                    onNavigateTab={setActiveTab}
                  />

                  <section aria-label="Student Internship Metrics">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <InternshipStatusCard
                        internship={internshipDetails}
                        onNavigateToInternship={() => setActiveTab("My Internship")}
                      />
                      <ProgressCard
                        progress={progress}
                        onNavigateToProgress={() => setActiveTab("Progress & Reports")}
                      />
                      <ReportsSubmittedCard
                        reports={reportsList}
                        onNavigateToReports={() => setActiveTab("Progress & Reports")}
                      />
                      <InternshipIntelligenceCard
                        attention={attentionData}
                        skills={skillsList}
                        onNavigateToIntelligence={() => setActiveTab("Intelligence")}
                      />
                    </div>
                  </section>

                  <CurrentInsightSection
                    attention={attentionData}
                    onNavigateToIntelligence={() => setActiveTab("Intelligence")}
                  />

                  <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span>
                        Logged in as <strong>{studentProfile.name}</strong> ({studentProfile.studentId}) • {studentProfile.department}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab("My Profile")}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
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

              {currentTab === "My Internship" && (
                <MyInternshipView
                  internship={internshipDetails}
                  studentId={currentUser ? (currentUser.student_id || currentUser.id) : undefined}
                  onRegistrationSuccess={async () => {
                    await loadStudentData();
                    setActiveTab("Dashboard");
                  }}
                />
              )}

              {currentTab === "Progress & Reports" && (
                <ProgressAndReportsView
                  progress={progress}
                  tasks={tasks}
                  reports={detailedReports}
                  internshipId={activeInternshipId || undefined}
                  studentId={currentUser ? (currentUser.student_id || currentUser.id) : undefined}
                  onReportSubmitted={loadStudentData}
                />
              )}

              {currentTab === "Intelligence" && (
                <IntelligenceView
                  attention={attentionData}
                  skills={skillsList}
                />
              )}

              {currentTab === "My Profile" && (
                <StudentProfileView
                  initialProfile={studentProfile}
                  studentId={currentUser ? (currentUser.student_id || currentUser.id) : undefined}
                  onProfileUpdate={setStudentProfile}
                />
              )}
            </>
          )}

          {/* ============================================================ */}
          {/* MENTOR PORTAL SCREENS */}
          {/* ============================================================ */}
          {currentRole === "mentor" && (
            <>
              {currentTab === "Dashboard" && (
                <MentorDashboardView
                  profile={mentorProfile}
                  interns={mentorInterns}
                  reports={allReports}
                  onNavigateTab={setActiveTab}
                  onOpenReviewReport={() => setActiveTab("Weekly Reports")}
                />
              )}

              {currentTab === "My Interns" && (
                <MentorInternsView
                  interns={mentorInterns}
                  reports={allReports}
                  onReportReviewed={loadMentorData}
                  onOpenEvaluationModal={(sId, iId) => {
                    setEvalPresetStudentId(sId);
                    setEvalPresetInternshipId(iId);
                    setActiveTab("Evaluations");
                  }}
                />
              )}

              {currentTab === "Weekly Reports" && (
                <MentorWeeklyReportsView
                  reports={allReports}
                  onReportReviewed={loadMentorData}
                />
              )}

              {currentTab === "Tasks" && (
                <MentorTasksView
                  tasks={mentorTasks}
                  interns={mentorInterns}
                  onTaskCreated={loadMentorData}
                />
              )}

              {currentTab === "Evaluations" && (
                <MentorEvaluationsView
                  evaluations={mentorEvaluations}
                  interns={mentorInterns}
                  onEvaluationCreated={loadMentorData}
                  presetStudentId={evalPresetStudentId}
                  presetInternshipId={evalPresetInternshipId}
                />
              )}

              {currentTab === "My Profile" && (
                <MentorProfileView
                  initialProfile={mentorProfile}
                  onProfileUpdated={(updated) => setMentorProfile(updated)}
                />
              )}
            </>
          )}

          {/* ============================================================ */}
          {/* ADMIN PORTAL SCREENS */}
          {/* ============================================================ */}
          {currentRole === "admin" && (
            <>
              {currentTab === "Dashboard" && (
                <AdminDashboardView
                  stats={adminStats}
                  applications={adminApplications}
                  onNavigateTab={setActiveTab}
                  onApproveApplication={async (id) => {
                    await adminApi.updateApplicationStatus(id, "Approved");
                    loadAdminData();
                  }}
                  onRejectApplication={async (id) => {
                    await adminApi.updateApplicationStatus(id, "Rejected");
                    loadAdminData();
                  }}
                />
              )}

              {currentTab === "Applications" && (
                <AdminApplicationsView
                  applications={adminApplications}
                  onApplicationUpdated={loadAdminData}
                />
              )}

              {currentTab === "Mentors" && (
                <AdminMentorsView
                  mentors={adminMentors}
                  internships={adminInternships}
                  onMentorAssigned={loadAdminData}
                />
              )}

              {currentTab === "Students" && (
                <AdminStudentsView students={adminStudents} />
              )}

              {currentTab === "Internships" && (
                <AdminInternshipsView internships={adminInternships} />
              )}

              {currentTab === "Reports & Alerts" && (
                <AdminReportsAlertsView items={adminReportsAlerts} />
              )}

              {currentTab === "Profile" && (
                <AdminProfileView currentUser={currentUser} />
              )}
            </>
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
