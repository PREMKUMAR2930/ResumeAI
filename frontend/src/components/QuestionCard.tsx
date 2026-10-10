import React from "react";
import { HelpCircle, Sparkles, Target, Award, GitBranch } from "lucide-react";
import { InterviewQuestion } from "../types";

interface QuestionCardProps {
  question: InterviewQuestion;
  currentNumber: number;
  totalPlanned: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentNumber,
  totalPlanned,
}) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "hard":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-500" />

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-sm">
            Question {currentNumber} of {totalPlanned}
          </span>

          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>

          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            {question.topic}
          </span>
        </div>

        {question.is_followup && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold animate-pulse">
            <GitBranch className="w-3.5 h-3.5" /> Adaptive Follow-Up Question
          </span>
        )}
      </div>

      {/* Main Question Text */}
      <div className="pt-2">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {question.question_text}
        </h2>
      </div>

      {/* Rationale / Focus concepts */}
      {question.rationale && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs text-slate-600">
          <Target className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <span><b>Interviewer Focus:</b> {question.rationale}</span>
        </div>
      )}
    </div>
  );
};
