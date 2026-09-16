"use client";

import React from "react";
import { MenuIcon, UserIcon } from "@/components/common/Icons";
import { mockStudentData } from "@/data/mockData";
import { UserProfile } from "@/lib/api";

interface TopNavbarProps {
  onOpenSidebar: () => void;
  activeTabTitle: string;
  currentUser?: UserProfile | null;
  backendConnected?: boolean;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export function TopNavbar({
  onOpenSidebar,
  activeTabTitle,
  currentUser,
  backendConnected = false,
  onOpenAuthModal,
  onLogout,
}: TopNavbarProps) {
  const { student } = mockStudentData;

  const displayName = currentUser
    ? currentUser.full_name
    : student.name;

  const displayRole = currentUser
    ? currentUser.role
    : "Student";

  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

      {/* ---------------------------------------- */}
      {/* Left: Mobile Menu + Page Title */}
      {/* ---------------------------------------- */}

      <div className="flex min-w-0 items-center gap-3">

        {/* Mobile Sidebar Button */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Open sidebar"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex min-w-0 items-center gap-2">

          <span className="hidden text-xs font-medium text-slate-400 sm:inline">
            Internship Portal
          </span>

          <span className="hidden text-xs text-slate-300 sm:inline">
            /
          </span>

          <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
            {activeTabTitle}
          </h1>

        </div>
      </div>

      {/* ---------------------------------------- */}
      {/* Right: Status + User */}
      {/* ---------------------------------------- */}

      <div className="flex items-center gap-2 sm:gap-3">

        {/* Backend Status */}
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
            backendConnected
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-amber-100 bg-amber-50 text-amber-700"
          }`}
          title={
            backendConnected
              ? "Backend API connected"
              : "Backend unavailable"
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              backendConnected
                ? "bg-emerald-500"
                : "bg-amber-500"
            }`}
          />

          {backendConnected ? "Connected" : "Offline"}
        </div>

        {/* ------------------------------------ */}
        {/* Logged In User */}
        {/* ------------------------------------ */}

        {currentUser ? (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">

            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {initials}
            </div>

            {/* Name + Role */}
            <div className="hidden min-w-0 sm:block">

              <p className="max-w-[130px] truncate text-xs font-semibold text-slate-800">
                {displayName}
              </p>

              <p className="mt-0.5 text-[10px] font-medium capitalize text-slate-400">
                {displayRole}
              </p>

            </div>

            {/* Sign Out */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-rose-600"
                title="Sign out"
              >
                Sign Out
              </button>
            )}

          </div>
        ) : (

          /* ------------------------------------ */
          /* Sign In */
          /* ------------------------------------ */

          <button
            type="button"
            onClick={onOpenAuthModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <UserIcon className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>

        )}

      </div>
    </header>
  );
}
