import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Download,
  FileText,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Compass,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  BookOpen
} from "lucide-react";
import { ScoreCard } from "../components/ScoreCard";
import { SkillRadarChart } from "../components/SkillRadarChart";
import { LoadingState } from "../components/LoadingState";
import { apiService } from "../services/api";
import { InterviewResults, QAHistoryItem } from "../types";

export const Results: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQa, setExpandedQa] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    apiService.getInterviewResults(sessionId)
      .then((data) => {
        setResults(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load results:", err);
        setIsLoading(false);
      });
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="py-24">
        <LoadingState
          title="Career Coach Agent Analyzing Results"
          subtitle="Synthesizing topic evaluations, generating personalized roadmap, and preparing final report..."
        />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Results Unavailable</h2>
        <p className="text-xs text-slate-500">Could not retrieve interview results for this session.</p>
        <Link
          to="/setup"
          className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-sm hover:bg-brand-700"
        >
          Start New Interview
        </Link>
      </div>
    );
  }

  const pdfDownloadUrl = sessionId ? apiService.getDownloadPdfUrl(sessionId) : "#";
  const jsonExportUrl = sessionId ? apiService.getExportJsonUrl(sessionId) : "#";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Interview Performance Report
          </h1>
          <p className="text-xs text-slate-500">
            Autonomous evaluation completed on {new Date(results.completed_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={jsonExportUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm inline-flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-slate-500" /> Export JSON
          </a>

          <a
            href={pdfDownloadUrl}
            download
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 inline-flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </a>
        </div>
      </div>

      {/* Hero Score Card */}
      <ScoreCard results={results} />

      {/* Strengths and Gaps Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Strongest Technical Topics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {results.strongest_topics.map((top, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                {top}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Key Growth Areas
          </span>
          <div className="flex flex-wrap gap-1.5">
            {results.improvement_areas.map((imp, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
                {imp}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Visualizations */}
      <SkillRadarChart topicScores={results.topic_breakdown} />

      {/* Personalized Career Coach Roadmap */}
      {results.career_plan && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Personalized Career Improvement Roadmap</h2>
              <p className="text-xs text-slate-500">Autonomous synthesis based on your real interview answers</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <p className="font-bold text-slate-900 mb-1">Career Coach Overall Assessment:</p>
            {results.career_plan.overall_assessment}
          </div>

          {/* 3 Priorities */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Recommended Action Priorities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.career_plan.priorities.map((prio, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                      Priority {prio.priority_level}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{prio.topic}</h4>
                    
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-600">Concepts to Review:</span>
                      <p className="text-[11px] text-slate-500">{prio.key_concepts_to_review.join(", ")}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-600">Study Action:</span>
                      <p className="text-[11px] text-slate-500">{prio.action_items.join("; ")}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-brand-700 font-medium">
                    <b>Exercise:</b> {prio.practical_exercises.join("; ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Resources */}
          {results.career_plan.recommended_resources.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2 text-xs">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Recommended High-Yield Resources
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-indigo-900">
                {results.career_plan.recommended_resources.map((res, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Detailed Q&A History Accordion */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900">Question-by-Question Evaluation</h2>
        <p className="text-xs text-slate-500">Review your responses, exact rubric scoring breakdown, and ideal model answers.</p>

        <div className="space-y-3 pt-2">
          {results.qa_history.map((item, idx) => {
            const isExpanded = expandedQa === idx;
            const evalItem = item.evaluation;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => setExpandedQa(isExpanded ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                      Q{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        {item.question.question_text}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.question.topic} • {item.question.difficulty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {evalItem && (
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                        {evalItem.score}/100
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 bg-white space-y-4 text-xs">
                    {/* Candidate Answer */}
                    <div className="space-y-1">
                      <span className="font-bold text-slate-700">Your Answer:</span>
                      <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {item.answer || "(No response submitted)"}
                      </p>
                    </div>

                    {evalItem && (
                      <>
                        {/* Rubric Score Breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-500 block">Correctness</span>
                            <span className="font-bold text-slate-800">{evalItem.technical_correctness}/40</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-500 block">Relevance</span>
                            <span className="font-bold text-slate-800">{evalItem.relevance}/25</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-500 block">Clarity</span>
                            <span className="font-bold text-slate-800">{evalItem.clarity}/20</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-500 block">Practical</span>
                            <span className="font-bold text-slate-800">{evalItem.practical_application}/15</span>
                          </div>
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900">
                            <span className="font-bold block mb-1">Strengths:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                              {evalItem.strengths.map((s, si) => <li key={si}>{s}</li>)}
                            </ul>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900">
                            <span className="font-bold block mb-1">Improvements:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                              {evalItem.improvements.map((im, imi) => <li key={imi}>{im}</li>)}
                            </ul>
                          </div>
                        </div>

                        {/* Benchmark Model Answer */}
                        <div className="space-y-1">
                          <span className="font-bold text-indigo-900 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-indigo-600" /> Benchmark Ideal Answer:
                          </span>
                          <p className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 font-mono text-[11px] text-indigo-950 leading-relaxed whitespace-pre-wrap">
                            {evalItem.ideal_answer}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Practice Again CTA */}
      <div className="text-center pt-4">
        <Link
          to="/setup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Practice Another Interview
        </Link>
      </div>
    </div>
  );
};
