"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (allowedRoles && allowedRoles.length > 0) {
        const userRole = (user.role || "").toLowerCase();
        const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRole);
        if (!isAllowed) {
          // Redirect to the user's appropriate portal
          if (userRole === "admin") router.replace("/admin");
          else if (userRole === "mentor") router.replace("/mentor");
          else router.replace("/student");
        }
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute font-bold text-xs tracking-wider text-indigo-400">SIMS</div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400 animate-pulse">
          Authenticating secure session...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || "").toLowerCase();
    const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRole);
    if (!isAllowed) {
      return null;
    }
  }

  return <>{children}</>;
}
export default ProtectedRoute;
