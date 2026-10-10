import axios from "axios";
import {
  ResumeAnalysis,
  JobDescriptionAnalysis,
  InterviewConfiguration,
  InterviewSessionData,
  InterviewQuestion,
  AnswerEvaluation,
  FollowUpDecision,
  InterviewResults,
  ProvidersResponse
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 70000,
});

export const apiService = {
  // Health & AI Status
  getHealth: async () => {
    const response = await apiClient.get("/health");
    return response.data;
  },

  getAIProvidersStatus: async (): Promise<ProvidersResponse> => {
    const response = await apiClient.get("/ai/providers");
    return response.data;
  },

  getOllamaModels: async () => {
    const response = await apiClient.get("/ai/ollama/models");
    return response.data;
  },

  // Resume Management
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{
      resume_id: string;
      filename: string;
      size_bytes: number;
      raw_text: string;
      preview: string;
      message: string;
    }>("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  analyzeResume: async (payload: {
    resume_id?: string;
    resume_text?: string;
    ai_provider?: string;
  }): Promise<ResumeAnalysis> => {
    const response = await apiClient.post<ResumeAnalysis>("/resume/analyze", payload);
    return response.data;
  },

  matchJobDescription: async (payload: {
    resume_analysis: ResumeAnalysis;
    job_description: string;
    ai_provider?: string;
  }): Promise<JobDescriptionAnalysis> => {
    const response = await apiClient.post<JobDescriptionAnalysis>("/resume/match-job", payload);
    return response.data;
  },

  deleteResume: async (resumeId: string) => {
    const response = await apiClient.delete(`/resume/${resumeId}`);
    return response.data;
  },

  // Interview Lifecycle
  createInterview: async (payload: {
    resume_analysis: ResumeAnalysis;
    config: InterviewConfiguration;
    job_description_analysis?: JobDescriptionAnalysis | null;
  }): Promise<InterviewSessionData> => {
    const response = await apiClient.post<InterviewSessionData>("/interviews", payload);
    return response.data;
  },

  getInterviewSession: async (sessionId: string): Promise<InterviewSessionData> => {
    const response = await apiClient.get<InterviewSessionData>(`/interviews/${sessionId}`);
    return response.data;
  },

  getCurrentQuestion: async (sessionId: string): Promise<InterviewQuestion | null> => {
    const response = await apiClient.get<InterviewQuestion | null>(`/interviews/${sessionId}/question`);
    return response.data;
  },

  submitAnswer: async (sessionId: string, payload: {
    question_id: string;
    answer_text: string;
    time_taken_seconds?: number;
  }): Promise<{
    session_id: string;
    evaluation: AnswerEvaluation;
    follow_up_decision: FollowUpDecision;
    next_question?: InterviewQuestion | null;
    is_completed: boolean;
    state: string;
  }> => {
    const response = await apiClient.post(`/interviews/${sessionId}/answer`, payload);
    return response.data;
  },

  advanceNextQuestion: async (sessionId: string): Promise<InterviewQuestion | null> => {
    const response = await apiClient.post<InterviewQuestion | null>(`/interviews/${sessionId}/next`);
    return response.data;
  },

  finishInterview: async (sessionId: string): Promise<InterviewResults> => {
    const response = await apiClient.post<InterviewResults>(`/interviews/${sessionId}/finish`);
    return response.data;
  },

  getInterviewResults: async (sessionId: string): Promise<InterviewResults> => {
    const response = await apiClient.get<InterviewResults>(`/interviews/${sessionId}/results`);
    return response.data;
  },

  deleteSession: async (sessionId: string) => {
    const response = await apiClient.delete(`/interviews/${sessionId}`);
    return response.data;
  },

  // Reports
  getDownloadPdfUrl: (sessionId: string) => {
    return `${API_BASE_URL}/interviews/${sessionId}/report/pdf`;
  },

  getExportJsonUrl: (sessionId: string) => {
    return `${API_BASE_URL}/interviews/${sessionId}/report/json`;
  }
};
