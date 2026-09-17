"use client";

import React, { useState } from "react";
import {
  ClipboardCheckIcon,
  PlusIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/common/Icons";
import { TaskItem, MentorInternItem, mentorsApi } from "@/lib/api";

interface Props {
  tasks: TaskItem[];
  interns: MentorInternItem[];
  onTaskCreated: () => void;
}

export function MentorTasksView({ tasks, interns, onTaskCreated }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("API");
  const [selectedStudentId, setSelectedStudentId] = useState(interns[0]?.student_id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a task title.");
      return;
    }

    const intern = interns.find((i) => i.student_id === selectedStudentId) || interns[0];
    if (!intern) {
      setErrorMsg("No intern available to assign task to.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await mentorsApi.createTask({
        internship_id: intern.internship_id,
        student_id: intern.student_id,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
      });

      setSuccessMsg("Task assigned successfully!");
      setTitle("");
      setDescription("");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        onTaskCreated();
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Task Management</h2>
          <p className="text-xs text-slate-500">
            Assign technical deliverables, microservice features, and engineering roadmaps
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No assigned tasks found. Click &quot;Assign New Task&quot; to assign a deliverable.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100">
                  <ClipboardCheckIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {task.category || "Engineering"}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">{task.description}</p>
                  )}
                  <div className="text-[11px] text-slate-400 mt-1.5">
                    Status: <strong className="text-slate-700">{task.status}</strong>
                  </div>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    task.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Assign Technical Task</h3>
              <p className="text-xs text-slate-500 mt-0.5">Specify milestone requirements for your intern</p>
            </div>

            {successMsg && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign To Intern</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                >
                  {interns.map((i) => (
                    <option key={i.student_id} value={i.student_id}>
                      {i.student_name} ({i.student_id_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement Redis caching layer with TTL expiration"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="API">API</option>
                  <option value="Database">Database</option>
                  <option value="Testing">Testing</option>
                  <option value="DevOps">DevOps</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Acceptance Criteria</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write clear instructions, test requirements, or repository branch guidelines..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Assigning..." : "Assign Deliverable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
