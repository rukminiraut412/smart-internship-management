"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardLayoutProps {
  role: "student" | "mentor" | "admin";
  activeTab: string;
  onTabChange: (tabId: string) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  role,
  activeTab,
  onTabChange,
  title,
  subtitle,
  children,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        role={role}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={title}
          subtitle={subtitle}
          onOpenMobileSidebar={() => setMobileMenuOpen(true)}
          onNavigateProfile={() => onTabChange("profile")}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
export default DashboardLayout;
