"use client";

import React from "react";
import { ArrowRightIcon } from "@/components/common/Icons";

interface Props {
  tabName: string;
  onBackToDashboard: () => void;
}

export function PlaceholderView({ tabName, onBackToDashboard }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto my-8">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-xl mb-4 ring-8 ring-indigo-50/50">
        {tabName.slice(0, 2).toUpperCase()}
      </div>

      <h2 className="text-xl font-bold text-slate-900">{tabName}</h2>
      <p className="text-xs font-semibold text-indigo-600 mt-1 uppercase tracking-wider">
        Active System Module
      </p>

      <div className="mt-8">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <span>Return to Dashboard</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
