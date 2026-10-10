import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  FileSearch,
  Brain,
  GitFork,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Bot,
  Zap,
  CheckCircle,
  Cpu,
  Layers,
  GraduationCap
} from "lucide-react";

export const Home: React.FC = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-brand-600 animate-spin" />
            Autonomous Agentic AI Interview Preparation System
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Master Technical Interviews Grounded in Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
              Actual Resume
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            No generic question banks. InterviewReady AI parses your real projects, skills, and target job description to conduct an interactive, adaptive technical interview with real-time coaching and personalized roadmaps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/setup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
            >
              Start AI Mock Interview
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm transition-all shadow-sm"
            >
              Explore Architecture
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-2xl font-black text-slate-900 block">100%</span>
              <span className="text-xs text-slate-500 font-medium">Resume & Project Grounded</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-2xl font-black text-brand-600 block">4-Tier</span>
              <span className="text-xs text-slate-500 font-medium">Standardized Scoring Rubric</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-2xl font-black text-indigo-600 block">Adaptive</span>
              <span className="text-xs text-slate-500 font-medium">Intelligent Follow-Up Agent</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-2xl font-black text-emerald-600 block">Zero DB</span>
              <span className="text-xs text-slate-500 font-medium">In-Memory Privacy Safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Autonomous Multi-Agent Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Unlike simple chatbots, InterviewReady AI coordinates specialized agents for extraction, planning, live questioning, rubric evaluation, and career coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Resume & JD Evidence Extractor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Extracts skills, project technologies, and claims with exact resume evidence. Cross-matches against your target Job Description without hallucinating false credentials.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Adaptive Follow-Up Agent</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dynamically evaluates your answers in real time to ask clarifying queries, delve into architectural internals, or adjust difficulty according to your responses.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Career Coach & PDF Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides topic-wise competency radars, benchmark ideal answers, and a personalized 3-priority study roadmap exportable as an academic-grade PDF.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-black">How InterviewReady AI Works</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Complete end-to-end interview simulation in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black text-base flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="font-bold text-base text-white">Upload & Configure</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your PDF/DOCX resume, optionally paste target JD, and choose your role, difficulty, AI engine (Ollama/Gemini), and coaching mode.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="font-bold text-base text-white">Live Interactive Interview</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Answer tailored questions via text or voice dictation. Receive instantaneous rubric-based coaching or experience a simulated uninterrupted mock interview.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="font-bold text-base text-white">Actionable Performance Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review scores, competency radar charts, strengths and gaps, ideal benchmark responses, and download your comprehensive ReportLab PDF report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual AI Engine & Privacy Guarantee */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-lg">Supported AI Models</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Switch effortlessly between <b>Local Ollama</b> (e.g. Llama 3, Mistral) for privacy-preserving local execution and <b>Google Gemini API</b> for high-speed cloud reasoning and evaluation.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Ollama (Llama 3 / Mistral)
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Google Gemini 1.5 / 2.5 Flash
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              Smart Hybrid Routing
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-lg">Privacy & In-Memory Storage</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            No permanent database is used. Resumes and interview answers are processed in temporary server memory with automatic TTL session expiration and file cleanup.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> No SQL or MongoDB database dependencies
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Automatic resume file deletion after processing
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 border-t border-slate-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-brand-600" />
          <span>InterviewReady AI — MCA Academic Project Demonstration</span>
        </div>
        <p>© 2026 InterviewReady AI. Built with FastAPI, React, TypeScript, Ollama & Gemini.</p>
      </footer>
    </div>
  );
};
