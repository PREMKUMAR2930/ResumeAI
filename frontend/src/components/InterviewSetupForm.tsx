import React from "react";
import { Sliders, Cpu, Zap, Bot, BookOpen, Clock, Settings2 } from "lucide-react";
import {
  RoleType,
  ExperienceLevel,
  InterviewType,
  Difficulty,
  AIProvider,
  FeedbackMode,
  InterviewConfiguration
} from "../types";

interface InterviewSetupFormProps {
  config: InterviewConfiguration;
  onChange: (config: InterviewConfiguration) => void;
}

const ROLES: RoleType[] = [
  "Java Developer",
  "Python Developer",
  "Full-Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Software Engineer",
  "Data Scientist / AI Engineer",
  "Custom"
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Fresher", "Intern", "Experienced"];
const INTERVIEW_TYPES: InterviewType[] = ["Technical", "Project-Based", "HR", "Mixed"];
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const QUESTION_COUNTS = [3, 5, 10, 15];

export const InterviewSetupForm: React.FC<InterviewSetupFormProps> = ({ config, onChange }) => {
  const updateField = <K extends keyof InterviewConfiguration>(key: K, value: InterviewConfiguration[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Sliders className="w-5 h-5 text-brand-600" />
        <h3 className="font-bold text-slate-900 text-base">Interview Configuration</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Target Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Target Role
          </label>
          <select
            value={config.role}
            onChange={(e) => updateField("role", e.target.value as RoleType)}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {config.role === "Custom" && (
            <input
              type="text"
              placeholder="Enter custom role title (e.g. Cloud Security Analyst)"
              value={config.custom_role || ""}
              onChange={(e) => updateField("custom_role", e.target.value)}
              className="mt-2 w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          )}
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Experience Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EXPERIENCE_LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => updateField("experience_level", lvl)}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  config.experience_level === lvl
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Interview Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Interview Focus Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {INTERVIEW_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField("interview_type", type)}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  config.interview_type === type
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => updateField("difficulty", diff)}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  config.difficulty === diff
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Number of Questions
          </label>
          <div className="grid grid-cols-4 gap-2">
            {QUESTION_COUNTS.map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => updateField("num_questions", cnt)}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  config.num_questions === cnt
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {cnt} Qs
              </button>
            ))}
          </div>
        </div>

        {/* AI Engine Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            AI Engine Provider
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateField("ai_provider", "hybrid")}
              className={`py-2 px-1 text-xs font-medium rounded-xl border flex items-center justify-center gap-1 transition-all ${
                config.ai_provider === "hybrid"
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Hybrid
            </button>
            <button
              type="button"
              onClick={() => updateField("ai_provider", "ollama")}
              className={`py-2 px-1 text-xs font-medium rounded-xl border flex items-center justify-center gap-1 transition-all ${
                config.ai_provider === "ollama"
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> Ollama
            </button>
            <button
              type="button"
              onClick={() => updateField("ai_provider", "gemini")}
              className={`py-2 px-1 text-xs font-medium rounded-xl border flex items-center justify-center gap-1 transition-all ${
                config.ai_provider === "gemini"
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Gemini
            </button>
          </div>
        </div>
      </div>

      {/* Mode & Follow-ups Toggles */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800">Interview Mode</span>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => updateField("feedback_mode", "coaching")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${
                  config.feedback_mode === "coaching"
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                Coaching Mode
              </button>
              <button
                type="button"
                onClick={() => updateField("feedback_mode", "mock")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${
                  config.feedback_mode === "mock"
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                Mock Interview Mode
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {config.feedback_mode === "coaching"
                ? "Instant AI evaluation and hints after each answer."
                : "Real-time simulation. All feedback saved for the final report."}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800">Adaptive Follow-Up Questions</span>
            <p className="text-[11px] text-slate-500">
              Agent dynamically asks clarifying or deeper questions.
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.include_followup}
            onChange={(e) => updateField("include_followup", e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
          />
        </div>
      </div>
    </div>
  );
};
