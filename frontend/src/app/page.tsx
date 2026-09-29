"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const role = (user.role || "").toLowerCase();
      if (role === "admin") router.replace("/admin");
      else if (role === "mentor") router.replace("/mentor");
      else router.replace("/student");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-400 font-medium">Loading EduIntern SIMMS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              SIM
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                EduIntern <span className="text-indigo-400">SIMMS</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Explainable Milestone Tracking & Early Attention Layer
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Smart Internship Management &amp;{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
                Continuous Monitoring
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Connect academia and industry with verifiable milestone tracking, live weekly
              progress reporting, deterministic skill-gap intelligence, and transparent supervision.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Access Portal</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-base transition-colors flex items-center justify-center"
              >
                Register as Student or Mentor
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Portal Roles Overview */}
        <section className="py-16 bg-slate-900/50 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Three Distinct Operational Portals</h2>
              <p className="text-slate-400 text-sm mt-2">Tailored workflows designed for every stakeholder</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Student Portal */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-indigo-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg mb-4 ring-1 ring-indigo-500/20">
                  ST
                </div>
                <h3 className="text-lg font-bold text-white">Student Portal</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Browse verified internships, apply to opportunities, log weekly progress reports, track completed hours, and view personalized skill gap analysis.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                  >
                    <span>Student Login</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Mentor Portal */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-amber-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-4 ring-1 ring-amber-500/20">
                  MT
                </div>
                <h3 className="text-lg font-bold text-white">Mentor Portal</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Oversee assigned student cohorts, review milestone submissions, evaluate performance, and trigger targeted interventions for students needing guidance.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
                  >
                    <span>Mentor Login</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Admin Console */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-rose-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-lg mb-4 ring-1 ring-rose-500/20">
                  AD
                </div>
                <h3 className="text-lg font-bold text-white">Admin Console</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Institutional governance: approve internship postings, match mentors to students, audit compliance, inspect system analytics, and manage access.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
                  >
                    <span>Administrator Access</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <p>Smart Internship Management and Monitoring System (SIMMS / EduIntern)</p>
        <p className="mt-1">Built with Next.js, FastAPI &amp; Explainable Decision Intelligence</p>
      </footer>
    </div>
  );
}