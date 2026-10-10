import React, { useState } from "react";
import { CheckCircle, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, ArrowRight, Bot, Zap, Award } from "lucide-react";
import { AnswerEvaluation } from "../types";

interface FeedbackCardProps {
  evaluation: AnswerEvaluation;
  onNext: () => void;
  isCompleted: boolean;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  evaluation,
  onNext,
  isCompleted,
}) => {
  const [showIdeal, setShowIdeal] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header with Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border text-base font-extrabold flex items-center gap-1.5 ${getScoreColor(evaluation.score)}`}>
            <Award className="w-5 h-5" />
            <span>{evaluation.score} / 100</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Answer Evaluation</h3>
            <p className="text-[11px] text-slate-500">
              Evaluated by {evaluation.provider_used || "AI Engine"} • Confidence: {Math.round((evaluation.confidence || 0.85) * 100)}%
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 active:scale-95 transition-all"
        >
          {isCompleted ? "View Comprehensive Report" : "Next Question"}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Rubric Breakdown Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="block text-[10px] font-semibold uppercase text-slate-500">Correctness</span>
          <span className="text-sm font-bold text-slate-800">{evaluation.technical_correctness} / 40</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="block text-[10px] font-semibold uppercase text-slate-500">Relevance</span>
          <span className="text-sm font-bold text-slate-800">{evaluation.relevance} / 25</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="block text-[10px] font-semibold uppercase text-slate-500">Clarity</span>
          <span className="text-sm font-bold text-slate-800">{evaluation.clarity} / 20</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="block text-[10px] font-semibold uppercase text-slate-500">Practical</span>
          <span className="text-sm font-bold text-slate-800">{evaluation.practical_application} / 15</span>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
          <span className="font-bold text-emerald-900 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Key Strengths
          </span>
          <ul className="space-y-1.5 text-emerald-800">
            {evaluation.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
          <span className="font-bold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Improvement Opportunities
          </span>
          <ul className="space-y-1.5 text-amber-800">
            {evaluation.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing Concepts if any */}
      {evaluation.missing_concepts && evaluation.missing_concepts.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-slate-700">
            <b>Suggested Concepts to Mention:</b> {evaluation.missing_concepts.join(", ")}
          </p>
        </div>
      )}

      {/* Model Answer Accordion */}
      {evaluation.ideal_answer && (
        <div className="border border-indigo-100 rounded-xl overflow-hidden bg-indigo-50/30">
          <button
            type="button"
            onClick={() => setShowIdeal(!showIdeal)}
            className="w-full p-3 text-xs font-bold text-indigo-900 flex items-center justify-between hover:bg-indigo-50/60 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-600" /> Model / Benchmark Answer
            </span>
            {showIdeal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showIdeal && (
            <div className="p-4 pt-1 text-xs text-indigo-950 font-mono leading-relaxed border-t border-indigo-100/50 bg-white/70 whitespace-pre-wrap">
              {evaluation.ideal_answer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
