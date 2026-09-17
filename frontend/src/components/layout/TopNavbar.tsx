import React, { useState } from "react";
import { MenuIcon, BellIcon, SearchIcon, UserIcon, XIcon } from "@/components/common/Icons";
import { mockStudentData } from "@/data/mockData";
import { UserProfile } from "@/lib/api";

interface TopNavbarProps {
  onOpenSidebar: () => void;
  activeTabTitle: string;
  currentUser?: UserProfile | null;
  backendConnected?: boolean;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onSearchChange?: (term: string) => void;
}

export function TopNavbar({
  onOpenSidebar,
  activeTabTitle,
  currentUser,
  backendConnected = false,
  onOpenAuthModal,
  onLogout,
  onSearchChange,
}: TopNavbarProps) {
  const { student, internship } = mockStudentData;
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const displayName = currentUser ? currentUser.full_name : student.name;
  const displayRole = currentUser ? currentUser.role : "Student";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const notifications = [
    {
      id: 1,
      title: "Weekly Report Reminder",
      desc: "Week 5 progress report window is open for submission.",
      time: "2h ago",
      type: "info",
    },
    {
      id: 2,
      title: "Mentor Evaluation Submitted",
      desc: "Dr. Marcus Vance reviewed and approved your Week 4 milestone.",
      time: "1d ago",
      type: "success",
    },
    {
      id: 3,
      title: "Placement Verified",
      desc: "CloudScale Distributed Systems internship credentials active.",
      time: "3d ago",
      type: "success",
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Page Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-indigo-600 hidden sm:inline uppercase tracking-wider">
            {displayRole} Portal
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline">/</span>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">{activeTabTitle}</h1>
        </div>
      </div>

      {/* Center / Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            placeholder="Search records, weekly logs, or skills..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-8 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                if (onSearchChange) onSearchChange("");
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Backend Health Status, Notifications & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Backend Connectivity Badge */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
            backendConnected
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
          title={backendConnected ? "Backend API service connected" : "Backend unreachable (mock mode)"}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              backendConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="hidden md:inline">
            {backendConnected ? "Backend Connected" : "Local Mode"}
          </span>
        </span>

        {/* Cohort Tag */}
        <div className="hidden lg:inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
          {internship.term}
        </div>

        {/* Notifications Icon with Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notifications ({notifications.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 first:pt-1.5 last:pb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Auth Toggle */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-indigo-100">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-none max-w-[120px] truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">
                  <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-indigo-700">
                    {displayRole}
                  </span>
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors ml-1 cursor-pointer border border-transparent hover:border-slate-200"
                  title="Sign out"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
