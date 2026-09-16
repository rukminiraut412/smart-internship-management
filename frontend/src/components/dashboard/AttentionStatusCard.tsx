import React from "react";
import { ShieldExclamationIcon, CheckCircleIcon, SparklesIcon, AlertCircleIcon } from "@/components/common/Icons";
import { AttentionStatus } from "@/data/mockData";

interface Props {
  attention: AttentionStatus;
}

export function AttentionStatusCard({ attention }: Props) {
  const isHealthy = attention.health === "Healthy";

  return (
    <div className="rounded-xl border border-indigo-100 bg-linear-to-br from-white via-indigo-50/20 to-white p-5 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
            <ShieldExclamationIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-bold text-slate-900">Attention Status</h2>
              <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200">
                <SparklesIcon className="w-3 h-3 text-indigo-500" />
                Explainable AI
              </span>
            </div>
            <p className="text-xs text-slate-500">Early-Intervention Health Layer</p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircleIcon className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            {attention.health}
          </span>
          <div className="text-[10px] text-slate-400 mt-0.5">Risk Score: {attention.riskScore}/100</div>
        </div>
      </div>

      {/* Explainable Factors Breakdown */}
      <div className="mt-4 space-y-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Explainable Health Signals
          </span>
          <div className="mt-1.5 space-y-1.5">
            {attention.flaggedReasons.map((reason, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 rounded-lg bg-white/80 border border-slate-200/70 p-2 text-xs text-slate-700"
              >
                <div className="mt-0.5 shrink-0">
                  {idx < 2 ? (
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircleIcon className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Proactive Actions */}
        <div className="rounded-lg bg-indigo-50/70 p-3 border border-indigo-100 text-xs">
          <span className="font-bold text-indigo-900 block mb-1">Recommended Action Plan</span>
          <ul className="space-y-1 text-indigo-800 list-disc list-inside">
            {attention.recommendedActions.map((action, idx) => (
              <li key={idx} className="leading-relaxed">
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Evaluated: {attention.lastEvaluated}</span>
        <span className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
          Intervention History →
        </span>
      </div>
    </div>
  );
}
