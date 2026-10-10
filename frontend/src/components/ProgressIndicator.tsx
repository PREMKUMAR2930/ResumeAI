import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { QAHistoryItem } from "../types";

interface ProgressIndicatorProps {
  currentIndex: number;
  totalQuestions: number;
  qaHistory: QAHistoryItem[];
  feedbackMode: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentIndex,
  totalQuestions,
  qaHistory,
  feedbackMode,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const progressPercentage = Math.min(100, Math.round(((currentIndex) / totalQuestions) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">
            Progress: {currentIndex} / {totalQuestions} Questions
          </span>
          <span className="text-slate-400">•</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
            {feedbackMode === "coaching" ? "Coaching Mode" : "Mock Interview"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-slate-700 font-semibold">
          <Clock className="w-4 h-4 text-brand-600" />
          <span>{formatTime(seconds)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Question Stepper Dots */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isAnswered = idx < qaHistory.length;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-full transition-all ${
                isAnswered
                  ? "bg-emerald-500"
                  : isCurrent
                  ? "bg-brand-600 ring-2 ring-brand-300"
                  : "bg-slate-200"
              }`}
              title={`Question ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};
