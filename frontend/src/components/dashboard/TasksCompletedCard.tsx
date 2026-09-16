import React from "react";
import { ClipboardCheckIcon, CheckCircleIcon, ClockIcon } from "@/components/common/Icons";
import { TaskItem } from "@/data/mockData";

interface Props {
  tasks: TaskItem[];
}

export function TasksCompletedCard({ tasks }: Props) {
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const totalCount = tasks.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <ClipboardCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Tasks Completed</h2>
            <p className="text-xs text-slate-500">Milestone Deliverables</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-emerald-600">{completedCount}</span>
          <span className="text-xs text-slate-400">/{totalCount} ({pct}%)</span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {tasks.slice(0, 3).map((task) => (
          <div
            key={task.id}
            className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 hover:bg-slate-100/70 transition-colors text-xs"
          >
            <div className="flex items-start space-x-2 min-w-0 pr-2">
              {task.status === "Completed" ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : task.status === "In Progress" ? (
                <ClockIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <span className={`block font-medium truncate ${task.status === "Completed" ? "text-slate-500 line-through" : "text-slate-800"}`}>
                  {task.title}
                </span>
                <span className="text-[10px] text-slate-400">Due {task.dueDate}</span>
              </div>
            </div>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                task.status === "Completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : task.status === "In Progress"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {task.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{inProgressCount} active in development</span>
        <span className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">View All Tasks →</span>
      </div>
    </div>
  );
}
