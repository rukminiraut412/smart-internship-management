import React from "react";
import { SparklesIcon, ArrowRightIcon } from "@/components/common/Icons";
import { AttentionStatus } from "@/data/mockData";

interface Props {
  attention: AttentionStatus;
  onNavigateToIntelligence?: () => void;
}

export function CurrentInsightSection({ attention, onNavigateToIntelligence }: Props) {
  const statusKey = attention.status || "ON_TRACK";
  const recommendation =
    (attention.recommendations && attention.recommendations[0]) ||
    (attention.recommendedActions && attention.recommendedActions[0]) ||
    "Maintain steady weekly report submission cadence to ensure continuous academic evaluation.";

  const reason =
    (attention.reasons && attention.reasons[0]) ||
    (attention.flaggedReasons && attention.flaggedReasons[0]) ||
    "All weekly milestones and task completion velocities match target requirements.";

  const isHealthy = statusKey === "ON_TRACK";

  return (
    <section aria-label="Current Internship Insight">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Current Insight</h2>
              <p className="text-xs text-slate-500">Algorithmic Academic Evaluation</p>
            </div>
          </div>

          <span
            className={`self-start sm:self-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
              isHealthy
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <span
              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                isHealthy ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {statusKey.replace("_", " ")}
          </span>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
          <div className="space-y-1 max-w-3xl">
            <p className="text-slate-800 font-medium">
              <strong>Recommendation:</strong> {recommendation}
            </p>
            <p className="text-slate-500">
              <span className="font-semibold text-slate-600">Key Factor:</span> {reason}
            </p>
          </div>

          {onNavigateToIntelligence && (
            <button
              type="button"
              onClick={onNavigateToIntelligence}
              className="inline-flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <span>Explore Intelligence</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
