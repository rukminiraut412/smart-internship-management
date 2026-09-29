"use client";

import React from "react";
import { useAuth } from "@/lib/auth";
import {
  DashboardIcon,
  UserIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  TargetIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClipboardCheckIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
} from "@/components/common/Icons";

export interface NavTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const studentTabs: NavTabItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "My Internship", label: "My Internship", icon: BriefcaseIcon },
  { id: "Progress & Reports", label: "Progress & Reports", icon: TrendingUpIcon },
  { id: "Intelligence", label: "Intelligence", icon: TargetIcon },
  { id: "My Profile", label: "My Profile", icon: UserIcon },
];

export const mentorTabs: NavTabItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "My Interns", label: "My Interns", icon: AcademicCapIcon },
  { id: "Weekly Reports", label: "Weekly Reports", icon: DocumentTextIcon },
  { id: "Tasks", label: "Tasks", icon: ClipboardCheckIcon },
  { id: "Evaluations", label: "Evaluations", icon: TrendingUpIcon },
  { id: "My Profile", label: "My Profile", icon: UserIcon },
];

export const adminTabs: NavTabItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "Students", label: "Students", icon: AcademicCapIcon },
  { id: "Internships", label: "Internships", icon: BriefcaseIcon },
  { id: "Applications", label: "Applications", icon: DocumentTextIcon },
  { id: "Mentors", label: "Mentors", icon: UserIcon },
  { id: "Reports & Alerts", label: "Reports & Alerts", icon: ShieldExclamationIcon },
  { id: "Profile", label: "Profile", icon: UserIcon },
];


interface SidebarProps {
  role: "student" | "mentor" | "admin";
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  role,
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth();

  const tabs =
    role === "admin"
      ? adminTabs
      : role === "mentor"
      ? mentorTabs
      : studentTabs;

  const roleTitle =
    role === "admin"
      ? "Admin Console"
      : role === "mentor"
      ? "Mentor Portal"
      : "Student Portal";

  const roleBadgeColor =
    role === "admin"
      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
      : role === "mentor"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20 ring-1 ring-white/20">
              SIM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">EduIntern</span>
                <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full border ${roleBadgeColor}`}>
                  {role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{roleTitle}</p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Navigation
          </div>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Footer with real authenticated info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-500/30">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "U")}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate leading-snug">
                  {user?.full_name || "User"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || "No email"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;
