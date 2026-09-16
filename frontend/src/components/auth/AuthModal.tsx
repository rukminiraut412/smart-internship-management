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
  const [email, setEmail] = useState("alex.rivera@university.edu");
  const [password, setPassword] = useState("SecurePassword123!");
  const [fullName, setFullName] = useState("Alex Rivera");
  const [role, setRole] = useState<"student" | "mentor">("student");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        const response = await authApi.login({
          email: email.trim(),
          password,
        });
        setSuccessMessage(`Welcome back, ${response.user.full_name}!`);
        setTimeout(() => {
          onAuthSuccess(response.user);
          onClose();
        }, 600);
      } else {
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
        }, 600);
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
              ? "Authenticate with your student or mentor credentials"
              : "Register as a student or mentor for progress monitoring"}
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
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
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
                placeholder="alex.rivera@university.edu"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
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
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    role === "student"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    role === "mentor"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Mentor
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

        {/* Demo Credentials Quick-Fill Hint */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          <span>Demo Account: </span>
          <button
            type="button"
            onClick={() => {
              setEmail("alex.rivera@university.edu");
              setPassword("SecurePassword123!");
            }}
            className="text-indigo-600 font-medium hover:underline"
          >
            alex.rivera@university.edu
          </button>
        </div>
      </div>
    </div>
  );
}
