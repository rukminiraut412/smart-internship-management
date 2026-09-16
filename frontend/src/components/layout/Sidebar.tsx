"use client";

import React from "react";
import {
  DashboardIcon,
  UserIcon,
  BriefcaseIcon,
  ClipboardCheckIcon,
  TrendingUpIcon,
  DocumentTextIcon,
  TargetIcon,
  BellIcon,
  XIcon,
} from "@/components/common/Icons";
import { mockStudentData } from "@/data/mockData";

export interface NavItem {
  id: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "My Profile", label: "My Profile", icon: UserIcon },
  { id: "Internship Registration", label: "Internship Registration", badge: "Form", badgeColor: "bg-indigo-100 text-indigo-700", icon: BriefcaseIcon },
  { id: "Internships", label: "Internships", icon: BriefcaseIcon },
  { id: "Applications", label: "Applications", icon: ClipboardCheckIcon },
  { id: "Progress", label: "Progress", icon: TrendingUpIcon },
  { id: "Weekly Reports", label: "Weekly Reports", badge: "Week 5", badgeColor: "bg-emerald-100 text-emerald-800", icon: DocumentTextIcon },
  { id: "Skill Gap", label: "Skill Gap", icon: TargetIcon },
  { id: "Notifications", label: "Notifications", badge: "2", badgeColor: "bg-amber-100 text-amber-800", icon: BellIcon },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const { student } = mockStudentData;

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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm">
              SI
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">SmartIntern</div>
              <div className="text-xs text-slate-500 font-medium">Monitoring System</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Institution Info Badge */}
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Portal</div>
          <div className="text-xs font-medium text-slate-700 truncate">{student.university}</div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.badgeColor || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Student Mini Profile Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm ring-2 ring-indigo-200">
              {student.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">{student.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{student.studentId}</div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Student Role • Active
          </div>
        </div>
      </aside>
    </>
  );
}
