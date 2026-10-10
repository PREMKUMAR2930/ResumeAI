import React, { useState } from "react";
import { Briefcase, CheckCircle2, AlertTriangle, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { apiService } from "../services/api";
import { ResumeAnalysis, JobDescriptionAnalysis } from "../types";

interface JobDescriptionFormProps {
  resumeAnalysis: ResumeAnalysis | null;
  onJobAnalysisComplete: (analysis: JobDescriptionAnalysis | null) => void;
  jobAnalysis: JobDescriptionAnalysis | null;
  selectedProvider: string;
}

export const JobDescriptionForm: React.FC<JobDescriptionFormProps> = ({
  resumeAnalysis,
  onJobAnalysisComplete,
  jobAnalysis,
  selectedProvider,
}) => {
  const [jdText, setJdText] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeJD = async () => {
    if (!resumeAnalysis) {
      setError("Please upload and analyze your resume first.");
      return;
    }
    if (!jdText.trim() || jdText.trim().length < 20) {
      setError("Please paste a comprehensive job description (at least 20 characters).");
      return;
    }

    setError(null);
    setIsMatching(true);
    try {
      const matchResult = await apiService.matchJobDescription({
        resume_analysis: resumeAnalysis,
        job_description: jdText,
        ai_provider: selectedProvider
      });
      setIsMatching(false);
      onJobAnalysisComplete(matchResult);
    } catch (err: any) {
      setIsMatching(false);
      setError(err.response?.data?.detail || "Failed to analyze job description.");
    }
  };

  const handleClear = () => {
    setJdText("");
    onJobAnalysisComplete(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Target Job Description <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </h3>
        </div>
        {jobAnalysis && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-red-600 font-medium"
          >
            Clear JD
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Paste a specific job opening requirements here to simulate role-specific technical questions aligned with employer needs.
      </p>

      <textarea
        rows={4}
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste job posting details, required skills, technologies, and responsibilities here..."
        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-y"
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={isMatching || !jdText.trim() || !resumeAnalysis}
          onClick={handleAnalyzeJD}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-sm"
        >
          {isMatching ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Comparing with Resume...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Match Resume Against JD
            </>
          )}
        </button>

        {jobAnalysis && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Analyzed: {jobAnalysis.job_title || "Target Role"}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* JD Skill Match Results */}
      {jobAnalysis && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Supported */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Supported ({jobAnalysis.matched_skills.length})
              </span>
              <p className="text-[11px] text-emerald-700">
                {jobAnalysis.matched_skills.map(m => m.skill).join(", ") || "None"}
              </p>
            </div>

            {/* Partial */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Partial ({jobAnalysis.partial_skills.length})
              </span>
              <p className="text-[11px] text-amber-700">
                {jobAnalysis.partial_skills.map(m => m.skill).join(", ") || "None"}
              </p>
            </div>

            {/* Missing */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> JD Skills Not in Resume ({jobAnalysis.missing_skills.length})
              </span>
              <p className="text-[11px] text-slate-600">
                {jobAnalysis.missing_skills.map(m => m.skill).join(", ") || "None"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
