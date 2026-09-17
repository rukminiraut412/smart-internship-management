"use client";

import React from "react";
import {
  DashboardIcon,
  UserIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  TargetIcon,
  XIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClipboardCheckIcon,
  ShieldExclamationIcon,
} from "@/components/common/Icons";
import { mockStudentData } from "@/data/mockData";
import { UserProfile } from "@/lib/api";

export interface NavItem {
  id: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const studentNavItems: NavItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: DashboardIcon },
  {
    id: "My Internship",
    label: "My Internship",
    icon: BriefcaseIcon,
  },
  {
    id: "Progress & Reports",
    label: "Progress & Reports",
    icon: TrendingUpIcon,
  },
  {
    id: "Intelligence",
    label: "Intelligence",
    icon: TargetIcon,
  },
  { id: "My Profile", label: "My Profile", icon: UserIcon },
];

export const mentorNavItems: NavItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: DashboardIcon },
  {
    id: "My Interns",
    label: "My Interns",
    icon: AcademicCapIcon,
  },
  {
    id: "Weekly Reports",
    label: "Weekly Reports",
    icon: DocumentTextIcon,
  },
  {
    id: "Tasks",
    label: "Tasks",
    icon: ClipboardCheckIcon,
  },
  {
    id: "Evaluations",
    label: "Evaluations",
    icon: TrendingUpIcon,
  },
  {
    id: "My Profile",
    label: "My Profile",
    icon: UserIcon,
  },
];

export const adminNavItems: NavItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: DashboardIcon },
  {
    id: "Students",
    label: "Students",
    icon: AcademicCapIcon,
  },
  {
    id: "Internships",
    label: "Internships",
    icon: BriefcaseIcon,
  },
  {
    id: "Applications",
    label: "Applications",
    icon: DocumentTextIcon,
  },
  {
    id: "Mentors",
    label: "Mentors",
    icon: UserIcon,
  },
  {
    id: "Reports & Alerts",
    label: "Reports & Alerts",
    icon: ShieldExclamationIcon,
  },
  {
    id: "Profile",
    label: "Profile",
    icon: UserIcon,
  },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  role?: "student" | "mentor" | "admin" | string;
  currentUser?: UserProfile | null;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  role = "student",
  currentUser,
}: SidebarProps) {
  const { student } = mockStudentData;

  const navItems =
    role === "mentor"
      ? mentorNavItems
      : role === "admin"
      ? adminNavItems
      : studentNavItems;

  const portalTitle =
    role === "mentor"
      ? "Industry Mentorship Portal"
      : role === "admin"
      ? "Institutional Admin Portal"
      : "Student Internship Portal";

  const userDisplayName = currentUser
    ? currentUser.full_name
    : student.name;

  const userInitials = userDisplayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel =
    role === "mentor"
      ? "Industry Mentor"
      : role === "admin"
      ? "System Administrator"
      : "Student";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-sm">
              SI
            </div>

            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">
                SmartIntern
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Internship Intelligence
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Institution / Role Info Badge */}
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            {role.toUpperCase()} PORTAL
          </div>

          <div className="text-xs font-semibold text-slate-700 truncate mt-0.5">
            {portalTitle}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-indigo-600"
                        : "text-slate-400"
                    }`}
                  />

                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.badgeColor ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm ring-2 ring-indigo-200">
              {userInitials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {userDisplayName}
              </div>

              <div className="text-[11px] text-slate-500 truncate">
                {currentUser
                  ? currentUser.email
                  : student.email}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            <span>{roleLabel}</span>

            <span className="flex items-center gap-1 text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}