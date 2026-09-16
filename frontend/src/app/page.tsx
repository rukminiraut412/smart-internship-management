"use client";

import React, { useState } from "react";
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
import { mockStudentData, StudentProfile } from "@/data/mockData";

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [showSubmissionNotice, setShowSubmissionNotice] = useState<boolean>(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(mockStudentData.student);

  const { internship, progress, tasks, reports, skills, attention } = mockStudentData;

  const handleActionClick = () => {
    setShowSubmissionNotice(true);
    setTimeout(() => {
      setShowSubmissionNotice(false);
    }, 4000);
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
        />

        {/* Action Notice Banner (if triggered) */}
        {showSubmissionNotice && (
          <div className="bg-indigo-600 px-4 py-2 text-center text-xs font-semibold text-white transition-all">
            Weekly Report Form will open here when connected to the backend API. Current cycle: Week 5.
          </div>
        )}

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {activeTab === "Dashboard" && (
            <div className="space-y-6">
              {/* Header Hero */}
              <DashboardHeader
                student={studentProfile}
                internship={internship}
                onActionClick={handleActionClick}
                onNavigateTab={setActiveTab}
              />

              {/* Core 6 Cards Grid */}
              <section aria-label="Student Internship Metrics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Card 1: Internship Status */}
                  <InternshipStatusCard internship={internship} />

                  {/* Card 2: Overall Progress */}
                  <ProgressCard progress={progress} />

                  {/* Card 3: Tasks Completed */}
                  <TasksCompletedCard tasks={tasks} />

                  {/* Card 4: Reports Submitted */}
                  <ReportsSubmittedCard reports={reports} />

                  {/* Card 5: Skill Match */}
                  <SkillMatchCard skills={skills} />

                  {/* Card 6: Attention Status (Explainable Early-Intervention) */}
                  <AttentionStatusCard attention={attention} />
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
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      Student Portal • Active
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "My Profile" && (
            <StudentProfileView
              initialProfile={studentProfile}
              onProfileUpdate={setStudentProfile}
            />
          )}

          {activeTab === "Internship Registration" && (
            <InternshipRegistrationView />
          )}

          {activeTab !== "Dashboard" &&
            activeTab !== "My Profile" &&
            activeTab !== "Internship Registration" && (
              <PlaceholderView
                tabName={activeTab}
                onBackToDashboard={() => setActiveTab("Dashboard")}
              />
            )}
        </main>
      </div>
    </div>
  );
}
