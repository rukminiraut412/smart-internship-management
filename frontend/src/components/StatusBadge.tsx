import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const norm = (status || "").toLowerCase().replace(/[- ]/g, "_");

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";

  switch (norm) {
    case "active":
    case "approved":
    case "completed":
    case "submitted":
    case "low":
    case "normal":
    case "passed":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20";
      break;

    case "pending":
    case "in_progress":
    case "in_review":
    case "needs_review":
    case "medium":
    case "warning":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20";
      break;

    case "rejected":
    case "failed":
    case "intervention_required":
    case "high":
    case "critical":
    case "urgent":
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20";
      break;

    case "assigned":
    case "ongoing":
    case "info":
    case "student":
    case "mentor":
    case "admin":
      colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20";
      break;

    default:
      colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
      break;
  }

  const formatText = (str: string) => {
    if (!str) return "Unknown";
    return str
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {formatText(status)}
    </span>
  );
}
export default StatusBadge;
