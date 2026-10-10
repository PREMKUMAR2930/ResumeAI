import React from "react";
import { Loader2, Sparkles, BrainCircuit } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "AI Agent Orchestrating...",
  subtitle = "Evaluating responses and analyzing technical depth."
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm space-y-4 max-w-lg mx-auto">
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-brand-100 animate-ping opacity-75" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
          <BrainCircuit className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};
