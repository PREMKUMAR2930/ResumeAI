export type RoleType = 
  | "Java Developer"
  | "Python Developer"
  | "Full-Stack Developer"
  | "Frontend Developer"
  | "Backend Developer"
  | "Software Engineer"
  | "Data Scientist / AI Engineer"
  | "Custom";

export type ExperienceLevel = "Fresher" | "Intern" | "Experienced";
export type InterviewType = "Technical" | "Project-Based" | "HR" | "Mixed";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type AIProvider = "ollama" | "gemini" | "hybrid";
export type FeedbackMode = "coaching" | "mock";

export interface SkillEvidence {
  name: string;
  evidence: string;
  confidence: number;
  category?: string;
}

export interface ProjectEvidence {
  name: string;
  description?: string;
  technologies: string[];
  possible_topics: string[];
  key_contributions?: string[];
}

export interface ExperienceEvidence {
  company?: string;
  role?: string;
  duration?: string;
  highlights: string[];
}

export interface EducationEvidence {
  degree?: string;
  institution?: string;
  year?: string;
  details?: string;
}

export interface ResumeAnalysis {
  candidate_name?: string;
  education: EducationEvidence[];
  skills: SkillEvidence[];
  programming_languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  projects: ProjectEvidence[];
  experience: ExperienceEvidence[];
  certifications: string[];
  achievements: string[];
  missing_information: string[];
  recommended_topics: string[];
  raw_text_preview?: string;
}

export interface MatchItem {
  skill: string;
  evidence: string;
  status: "supported" | "partial" | "missing";
}

export interface JobDescriptionAnalysis {
  job_title?: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  experience_expectations?: string;
  matched_skills: MatchItem[];
  partial_skills: MatchItem[];
  missing_skills: MatchItem[];
  interview_focus_areas: string[];
}

export interface InterviewConfiguration {
  role: RoleType | string;
  custom_role?: string;
  experience_level: ExperienceLevel;
  interview_type: InterviewType;
  difficulty: Difficulty;
  num_questions: number;
  ai_provider: AIProvider;
  feedback_mode: FeedbackMode;
  include_followup: boolean;
  max_followup: number;
  job_description?: string;
}

export interface InterviewQuestion {
  question_id: string;
  question_number: number;
  question_text: string;
  topic: string;
  category: string;
  difficulty: Difficulty;
  rationale?: string;
  is_followup: boolean;
  followup_to_id?: string | null;
  expected_key_concepts: string[];
}

export interface AnswerEvaluation {
  question_id: string;
  score: number;
  technical_correctness: number;
  relevance: number;
  clarity: number;
  practical_application: number;
  strengths: string[];
  improvements: string[];
  missing_concepts: string[];
  ideal_answer: string;
  confidence: number;
  provider_used?: string;
}

export interface FollowUpDecision {
  action: string;
  reason: string;
  follow_up_question?: string | null;
  topic?: string;
  target_difficulty?: Difficulty;
  should_end: boolean;
}

export interface QAHistoryItem {
  question: InterviewQuestion;
  answer?: string;
  evaluation?: AnswerEvaluation;
  follow_up_decision?: FollowUpDecision;
  answered_at?: string;
}

export interface TopicScore {
  topic: string;
  score: number;
  questions_count: number;
  correctness_avg: number;
  relevance_avg: number;
}

export interface ImprovementPriority {
  priority_level: number;
  topic: string;
  key_concepts_to_review: string[];
  action_items: string[];
  practical_exercises: string[];
}

export interface CareerImprovementPlan {
  overall_assessment: string;
  priorities: ImprovementPriority[];
  recommended_resources: string[];
  mock_test_suggestions: string[];
}

export interface InterviewResults {
  session_id: string;
  candidate_name: string;
  role: string;
  interview_type: string;
  difficulty: string;
  overall_score: number;
  total_questions_planned: number;
  total_questions_answered: number;
  correctness_score: number;
  relevance_score: number;
  clarity_score: number;
  practical_score: number;
  topic_breakdown: TopicScore[];
  strongest_topics: string[];
  improvement_areas: string[];
  qa_history: QAHistoryItem[];
  career_plan?: CareerImprovementPlan;
  ai_provider_used: string;
  duration_seconds: number;
  started_at: string;
  completed_at: string;
  disclaimer: string;
}

export interface InterviewSessionData {
  session_id: string;
  state: string;
  resume_analysis?: ResumeAnalysis;
  job_description_analysis?: JobDescriptionAnalysis;
  config?: InterviewConfiguration;
  question_plan: InterviewQuestion[];
  current_question_index: number;
  current_question?: InterviewQuestion;
  followup_count: number;
  max_followup: number;
  is_current_followup: boolean;
  qa_history: QAHistoryItem[];
  career_plan?: CareerImprovementPlan;
  results?: InterviewResults;
}

export interface ProviderStatus {
  provider: string;
  available: boolean;
  model: string;
  message: string;
}

export interface ProvidersResponse {
  ollama: ProviderStatus;
  gemini: ProviderStatus;
  default_provider: string;
}
