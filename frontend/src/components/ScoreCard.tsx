import React from "react";
import { Award, CheckCircle, Target, Sparkles, Activity } from "lucide-react";
import { InterviewResults } from "../types";

interface ScoreCardProps {
  results: InterviewResults;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ results }) => {
  const getScoreBadge = (score: number) => {
    if (score >= 85) return { label: "Excellent Performance", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 70) return { label: "Good Performance", color: "text-indigo-700 bg-indigo-50 border-indigo-200" };
    if (score >= 50) return { label: "Needs Practice", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Foundational Gaps", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const badge = getScoreBadge(results.overall_score);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Overall Score Circle */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 p-1 shadow-lg shadow-brand-500/30">
            <div className="w-full h-full bg-slate-900 rounded-full flex flex-col items-center justify-center p-2">
              <span className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-brand-300">
                {results.overall_score}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">OUT OF 100</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm bg-white/10 border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              {badge.label}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {results.candidate_name}’s Interview Evaluation
            </h2>

            <p className="text-xs text-slate-300">
              Role: <span className="font-semibold text-white">{results.role}</span> ({results.difficulty} - {results.interview_type})
            </p>
          </div>
        </div>

        {/* Right: Rubric 4-Bar Metric Matrix */}
        <div className="w-full md:w-72 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Technical Correctness</span>
              <span className="text-brand-300">{results.correctness_score} / 40</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-400 rounded-full" style={{ width: `${(results.correctness_score / 40) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Relevance to Question</span>
              <span className="text-indigo-300">{results.relevance_score} / 25</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(results.relevance_score / 25) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Explanation & Clarity</span>
              <span className="text-purple-300">{results.clarity_score} / 20</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(results.clarity_score / 20) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Practical Examples</span>
              <span className="text-emerald-300">{results.practical_score} / 15</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(results.practical_score / 15) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
