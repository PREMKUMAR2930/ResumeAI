import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { ResumeUploader } from "../components/ResumeUploader";
import { JobDescriptionForm } from "../components/JobDescriptionForm";
import { InterviewSetupForm } from "../components/InterviewSetupForm";
import { LoadingState } from "../components/LoadingState";
import { apiService } from "../services/api";
import {
  ResumeAnalysis,
  JobDescriptionAnalysis,
  InterviewConfiguration
} from "../types";

export const SetupInterview: React.FC = () => {
  const navigate = useNavigate();

  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<JobDescriptionAnalysis | null>(null);

  const [config, setConfig] = useState<InterviewConfiguration>({
    role: "Java Developer",
    experience_level: "Fresher",
    interview_type: "Technical",
    difficulty: "Medium",
    num_questions: 5,
    ai_provider: "hybrid",
    feedback_mode: "coaching",
    include_followup: true,
    max_followup: 3,
  });

  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartInterview = async () => {
    if (!resumeAnalysis) {
      setError("Please upload and analyze your resume first.");
      return;
    }

    setError(null);
    setIsStarting(true);
    try {
      const session = await apiService.createInterview({
        resume_analysis: resumeAnalysis,
        config: config,
        job_description_analysis: jobAnalysis,
      });

      setIsStarting(false);
      navigate(`/interview/${session.session_id}`);
    } catch (err: any) {
      setIsStarting(false);
      const msg = err.response?.data?.detail || err.message || "Failed to initialize interview session.";
      setError(msg);
    }
  };

  if (isStarting) {
    return (
      <div className="py-20">
        <LoadingState
          title="Autonomous Planner Agent Active"
          subtitle="Synthesizing resume evidence, structuring questions, and calibrating difficulty progression..."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Configure Your Technical Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Upload your resume to ground the questions in your verified background, or match against a custom target job description.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="font-bold">Cannot Start Interview</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Resume Upload */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
            1
          </div>
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">Upload Candidate Resume</h2>
        </div>
        <ResumeUploader
          onAnalysisComplete={(analysis, id) => {
            setResumeAnalysis(analysis);
            if (id) setResumeId(id);
          }}
          analysis={resumeAnalysis}
          selectedProvider={config.ai_provider}
        />
      </section>

      {/* Step 2: Target Job Description (Optional) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
            2
          </div>
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">Target Job Description (Optional)</h2>
        </div>
        <JobDescriptionForm
          resumeAnalysis={resumeAnalysis}
          onJobAnalysisComplete={setJobAnalysis}
          jobAnalysis={jobAnalysis}
          selectedProvider={config.ai_provider}
        />
      </section>

      {/* Step 3: Interview Preferences */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
            3
          </div>
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">Interview & AI Model Settings</h2>
        </div>
        <InterviewSetupForm config={config} onChange={setConfig} />
      </section>

      {/* Launch Action Bar */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center sm:text-left">
          {resumeAnalysis
            ? `Ready to test ${resumeAnalysis.skills.length} extracted skills for ${config.role}.`
            : "Please upload your resume to enable interview launch."}
        </p>

        <button
          type="button"
          disabled={!resumeAnalysis || isStarting}
          onClick={handleStartInterview}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:shadow-none transition-all"
        >
          <Sparkles className="w-4 h-4 text-brand-200" />
          Launch AI Interview
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
