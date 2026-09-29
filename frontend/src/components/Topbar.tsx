"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { UserMenu } from "@/components/UserMenu";
import { alertsApi, healthCheck, BackendAlert } from "@/lib/api";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar?: () => void;
  onNavigateProfile?: () => void;
}

export function Topbar({
  title,
  subtitle,
  onOpenMobileSidebar,
  onNavigateProfile,
}: TopbarProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Load real backend alerts if available
  useEffect(() => {
    let isMounted = true;

    async function loadAlertsAndHealth() {
      try {
        const isHealthy = await healthCheck();
        if (isMounted) setBackendOnline(isHealthy);
      } catch {
        if (isMounted) setBackendOnline(false);
      }

      if (user) {
        try {
          const res = await alertsApi.list();
          if (isMounted && Array.isArray(res)) {
            setAlerts(res);
          }
        } catch {
          // If no alerts endpoint or fails, alerts remain empty array
        }
      }
    }

    loadAlertsAndHealth();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle clicking outside alerts dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setIsAlertsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Backend Connectivity Status */}
        {backendOnline !== null && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-slate-50 text-slate-600 border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span>{backendOnline ? "Backend Live" : "Offline"}</span>
          </div>
        )}

        {/* Real Alerts Notification Dropdown */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="View notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400">
                    <svg
                      className="w-8 h-8 mx-auto mb-2 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-xs font-medium">No alerts or notifications yet.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`px-4 py-3 hover:bg-slate-50 transition-colors ${
                        !alert.is_read ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800">{alert.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <UserMenu onNavigateProfile={onNavigateProfile} />
      </div>
    </header>
  );
}
export default Topbar;
