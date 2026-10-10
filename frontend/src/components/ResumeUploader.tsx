import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Plus, Sparkles, Loader2 } from "lucide-react";
import { apiService } from "../services/api";
import { ResumeAnalysis } from "../types";

interface ResumeUploaderProps {
  onAnalysisComplete: (analysis: ResumeAnalysis, resumeId?: string) => void;
  analysis: ResumeAnalysis | null;
  selectedProvider: string;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onAnalysisComplete,
  analysis,
  selectedProvider,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setError(null);
    if (!file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError("Please upload a valid PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    try {
      // 1. Upload & Extract Text
      const uploadRes = await apiService.uploadResume(file);
      setIsUploading(false);
      
      // 2. Autonomous Agent Analysis
      setIsAnalyzing(true);
      const parsedAnalysis = await apiService.analyzeResume({
        resume_id: uploadRes.resume_id,
        resume_text: uploadRes.raw_text,
        ai_provider: selectedProvider
      });
      setIsAnalyzing(false);

      onAnalysisComplete(parsedAnalysis, uploadRes.resume_id);
    } catch (err: any) {
      setIsUploading(false);
      setIsAnalyzing(false);
      const msg = err.response?.data?.detail || err.message || "Failed to process resume.";
      setError(msg);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const addCustomSkill = () => {
    if (!newSkill.trim() || !analysis) return;
    const updated = {
      ...analysis,
      skills: [
        ...analysis.skills,
        { name: newSkill.trim(), evidence: "User added", confidence: 1.0, category: "Custom" }
      ]
    };
    onAnalysisComplete(updated);
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    if (!analysis) return;
    const updated = {
      ...analysis,
      skills: analysis.skills.filter((_, i) => i !== index)
    };
    onAnalysisComplete(updated);
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-brand-500 bg-brand-50/60 scale-[1.01]"
            : "border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/50 shadow-sm"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
          accept=".pdf,.docx,.txt"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-inner">
            {isUploading || isAnalyzing ? (
              <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <p className="text-base font-semibold text-slate-800">
              {fileName ? fileName : "Upload your resume (PDF, DOCX, or TXT)"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Drag and drop your file here, or click to browse (Max 5MB)
            </p>
          </div>

          {(isUploading || isAnalyzing) && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              {isUploading ? "Uploading & Extracting text..." : "AI Agent analyzing skills & projects..."}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">Upload Notice</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Extracted Profile Preview */}
      {analysis && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 text-base">
                Extracted Profile: <span className="text-brand-600">{analysis.candidate_name || "Candidate"}</span>
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified from Resume
            </span>
          </div>

          {/* Detected Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Extracted Technical Skills ({analysis.skills.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
                  title={skill.evidence}
                >
                  {skill.name}
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Custom Skill */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Add missing skill (e.g. Docker, Redis)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none flex-1"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Detected Projects */}
          {analysis.projects.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Identified Projects ({analysis.projects.length})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.projects.map((proj, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-semibold text-slate-800 text-xs">{proj.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.technologies.map((t, ti) => (
                        <span key={ti} className="px-1.5 py-0.5 text-[10px] font-medium bg-brand-50 text-brand-700 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
