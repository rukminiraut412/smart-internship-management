"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  adminApi,
  AdminStats,
  AdminApplicationItem,
  AdminMentorItem,
  AdminStudentItem,
  AdminInternshipItem,
  AdminReportAlertItem,
} from "@/lib/api";

// Admin Views
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import { AdminStudentsView } from "@/components/admin/AdminStudentsView";
import { AdminInternshipsView } from "@/components/admin/AdminInternshipsView";
import { AdminApplicationsView } from "@/components/admin/AdminApplicationsView";
import { AdminMentorsView } from "@/components/admin/AdminMentorsView";
import { AdminReportsAlertsView } from "@/components/admin/AdminReportsAlertsView";
import { AdminProfileView } from "@/components/admin/AdminProfileView";

export default function AdminPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Live admin state
  const [stats, setStats] = useState<AdminStats>({
    total_students: 0,
    active_internships: 0,
    total_companies: 0,
    total_mentors: 0,
    pending_applications: 0,
    reports_pending_review: 0,
    students_needing_attention: 0,
    completed_internships: 0,
  });


  const [applications, setApplications] = useState<AdminApplicationItem[]>([]);
  const [mentors, setMentors] = useState<AdminMentorItem[]>([]);
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [internships, setInternships] = useState<AdminInternshipItem[]>([]);
  const [reportsAndAlerts, setReportsAndAlerts] = useState<AdminReportAlertItem[]>([]);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // 1. Fetch Admin Stats
      try {
        const s = await adminApi.getStats();
        setStats(s);
      } catch {
        // Fallback stats computed from collections
      }

      // 2. Fetch Applications
      try {
        const apps = await adminApi.getApplications();
        setApplications(Array.isArray(apps) ? apps : []);
      } catch {
        setApplications([]);
      }

      // 3. Fetch Mentors
      try {
        const m = await adminApi.getMentors();
        setMentors(Array.isArray(m) ? m : []);
      } catch {
        setMentors([]);
      }

      // 4. Fetch Students
      try {
        const stu = await adminApi.getStudents();
        setStudents(Array.isArray(stu) ? stu : []);
      } catch {
        setStudents([]);
      }

      // 5. Fetch Internships
      try {
        const inter = await adminApi.getInternships();
        setInternships(Array.isArray(inter) ? inter : []);
      } catch {
        setInternships([]);
      }

      // 6. Fetch Reports & Alerts
      try {
        const ra = await adminApi.getReportsAndAlerts();
        setReportsAndAlerts(Array.isArray(ra) ? ra : []);
      } catch {
        setReportsAndAlerts([]);
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load admin console.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleApproveApplication = async (id: string) => {
    try {
      await adminApi.updateApplicationStatus(id, "Approved");
      loadAdminData();
    } catch (err) {
      console.error("Failed to approve application:", err);
    }
  };

  const handleRejectApplication = async (id: string) => {
    try {
      await adminApi.updateApplicationStatus(id, "Rejected");
      loadAdminData();
    } catch (err) {
      console.error("Failed to reject application:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout
        role="admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="Institutional Admin Console"
        subtitle="Manage academic student cohorts, verify placements, oversee mentors, and monitor risk alerts"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
            <p className="mt-4 text-xs font-semibold text-slate-400">Loading institutional metrics...</p>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800">
            <p className="font-bold text-sm">Failed to connect to administration service</p>
            <p className="mt-1 text-slate-600">{loadError}</p>
            <button
              onClick={loadAdminData}
              className="mt-4 px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "Dashboard" && (
              <AdminDashboardView
                stats={stats}
                applications={applications}
                onNavigateTab={setActiveTab}
                onApproveApplication={handleApproveApplication}
                onRejectApplication={handleRejectApplication}
              />
            )}

            {activeTab === "Students" && (
              <AdminStudentsView students={students} />
            )}

            {activeTab === "Internships" && (
              <AdminInternshipsView internships={internships} />
            )}

            {activeTab === "Applications" && (
              <AdminApplicationsView
                applications={applications}
                onApplicationUpdated={loadAdminData}
              />
            )}

            {activeTab === "Mentors" && (
              <AdminMentorsView
                mentors={mentors}
                internships={internships}
                onMentorAssigned={loadAdminData}
              />
            )}

            {activeTab === "Reports & Alerts" && (
              <AdminReportsAlertsView items={reportsAndAlerts} />
            )}

            {activeTab === "Profile" && (
              <AdminProfileView currentUser={user} />
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
