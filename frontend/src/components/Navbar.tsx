import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Bot, Cpu, Zap } from "lucide-react";
import { apiService } from "../services/api";
import { ProvidersResponse } from "../types";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [providers, setProviders] = useState<ProvidersResponse | null>(null);

  useEffect(() => {
    apiService.getAIProvidersStatus()
      .then(setProviders)
      .catch(() => setProviders(null));
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand-900 to-brand-600">
              InterviewReady<span className="text-brand-600"> AI</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Autonomous Agent
            </span>
          </div>
        </Link>

        {/* Navigation & Provider Badges */}
        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            <Link 
              to="/" 
              className={`hover:text-brand-600 transition-colors ${location.pathname === "/" ? "text-brand-600 font-semibold" : ""}`}
            >
              Home
            </Link>
            <Link 
              to="/setup" 
              className={`hover:text-brand-600 transition-colors ${location.pathname === "/setup" ? "text-brand-600 font-semibold" : ""}`}
            >
              New Interview
            </Link>
          </nav>

          {/* AI Providers Status Pills */}
          <div className="flex items-center gap-2 text-xs">
            {providers?.ollama.available ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium" title={providers.ollama.message}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Bot className="w-3.5 h-3.5" /> Ollama Local
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200" title="Ollama offline">
                <Bot className="w-3.5 h-3.5" /> Ollama Offline
              </span>
            )}

            {providers?.gemini.available ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium" title={providers.gemini.message}>
                <Zap className="w-3.5 h-3.5 text-indigo-600" /> Gemini Ready
              </span>
            ) : null}
          </div>

          <Link
            to="/setup"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all"
          >
            Start Practice
          </Link>
        </div>
      </div>
    </header>
  );
};
