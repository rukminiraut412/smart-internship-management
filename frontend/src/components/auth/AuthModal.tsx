"use client";

import React, { useState } from "react";
import { UserProfile, authApi, ApiError } from "@/lib/api";
import {
  UserIcon,
  MailIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/common/Icons";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "mentor" | "admin">("student");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillDemo = (demoEmail: string, demoRole?: "student" | "mentor" | "admin") => {
    setEmail(demoEmail);
    setPassword("SecurePassword123!");
    if (demoRole) {
      setRole(demoRole);
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const response = await authApi.login({
          email: email.trim(),
          password,
        });
        setSuccessMessage(`Welcome back, ${response.user.full_name}! (${response.user.role.toUpperCase()})`);
        setTimeout(() => {
          onAuthSuccess(response.user);
          onClose();
        }, 500);
      } else {
        if (!fullName.trim()) {
          setErrorMessage("Please provide your full name.");
          setIsLoading(false);
          return;
        }

        const registered = await authApi.register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role,
        });
        setSuccessMessage("Account registered successfully! Logging you in...");
        // Auto-login after registration
        const loginRes = await authApi.login({
          email: email.trim(),
          password,
        });
        setTimeout(() => {
          onAuthSuccess(loginRes.user || registered);
          onClose();
        }, 500);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected authentication error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3 shadow-inner">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {mode === "login" ? "Sign In to SmartIntern" : "Create an Account"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "login"
              ? "Select a demo account or sign in with your credentials"
              : "Register as a student, industry mentor, or demo administrator"}
          </p>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === "register"
                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register
          </button>
        </div>

        {/* Demo Quick-Fill Section (Visible on Login tab) */}
        {mode === "login" && (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 mb-2 flex items-center justify-between">
              <span>Quick Demo Accounts</span>
              <span className="text-[10px] font-normal text-indigo-600">One-click sign in fill</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo("alex.rivera@university.edu", "student")}
                className="rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-center text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 shadow-2xs transition-colors"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("m.vance@cloudscale.io", "mentor")}
                className="rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-center text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 shadow-2xs transition-colors"
              >
                👔 Mentor
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("admin@university.edu", "admin")}
                className="rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-center text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 shadow-2xs transition-colors"
              >
                ⚡ Admin
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MailIcon className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    role === "student"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    role === "mentor"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Mentor
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    role === "admin"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Admin (Demo)
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isLoading
                ? "Processing..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

