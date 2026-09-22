"use client";

import React from "react";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useSkillSwap();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xl shadow-gray-950/10 dark:shadow-black/60 animate-in fade-in slide-in-from-bottom-3 duration-200 transition-all"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : toast.type === "info" ? (
              <Info className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{toast.title}</h4>
            {toast.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-normal">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
