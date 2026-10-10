from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class RoleEnum(str, Enum):
    JAVA_DEV = "Java Developer"
    PYTHON_DEV = "Python Developer"
    FULLSTACK_DEV = "Full-Stack Developer"
    FRONTEND_DEV = "Frontend Developer"
    BACKEND_DEV = "Backend Developer"
    SOFTWARE_ENGINEER = "Software Engineer"
    DATA_SCIENTIST = "Data Scientist / AI Engineer"
    CUSTOM = "Custom"

class ExperienceLevelEnum(str, Enum):
    FRESHER = "Fresher"
    INTERN = "Intern"
    EXPERIENCED = "Experienced"

class InterviewTypeEnum(str, Enum):
    TECHNICAL = "Technical"
    PROJECT_BASED = "Project-Based"
    HR = "HR"
    MIXED = "Mixed"

class DifficultyEnum(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class AIProviderEnum(str, Enum):
    OLLAMA = "ollama"
    GEMINI = "gemini"
    HYBRID = "hybrid"

class FeedbackModeEnum(str, Enum):
    COACHING = "coaching"
    MOCK = "mock"

class FollowUpActionEnum(str, Enum):
    ASK_CLARIFYING = "ask_clarifying"
    ASK_DEEPER = "ask_deeper"
    ASK_PRACTICAL = "ask_practical"
    NEXT_TOPIC = "next_topic"
    REDUCE_DIFFICULTY = "reduce_difficulty"
    INCREASE_DIFFICULTY = "increase_difficulty"
    SKIP_TOPIC = "skip_topic"
    END_INTERVIEW = "end_interview"

# ==================== Resume & JD Schemas ====================

class SkillEvidence(BaseModel):
    name: str
    evidence: str
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    category: Optional[str] = "General"

class ProjectEvidence(BaseModel):
    name: str
    description: Optional[str] = ""
    technologies: List[str] = Field(default_factory=list)
    possible_topics: List[str] = Field(default_factory=list)
    key_contributions: Optional[List[str]] = Field(default_factory=list)

class ExperienceEvidence(BaseModel):
    company: Optional[str] = ""
    role: Optional[str] = ""
    duration: Optional[str] = ""
    highlights: List[str] = Field(default_factory=list)

class EducationEvidence(BaseModel):
    degree: Optional[str] = ""
    institution: Optional[str] = ""
    year: Optional[str] = ""
    details: Optional[str] = ""

class ResumeAnalysis(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    education: List[EducationEvidence] = Field(default_factory=list)
    skills: List[SkillEvidence] = Field(default_factory=list)
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    projects: List[ProjectEvidence] = Field(default_factory=list)
    experience: List[ExperienceEvidence] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    recommended_topics: List[str] = Field(default_factory=list)
    raw_text_preview: Optional[str] = ""

class MatchItem(BaseModel):
    skill: str
    evidence: str
    status: str # "supported", "partial", "missing"

class JobDescriptionAnalysis(BaseModel):
    job_title: Optional[str] = ""
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    experience_expectations: Optional[str] = ""
    matched_skills: List[MatchItem] = Field(default_factory=list)
    partial_skills: List[MatchItem] = Field(default_factory=list)
    missing_skills: List[MatchItem] = Field(default_factory=list)
    interview_focus_areas: List[str] = Field(default_factory=list)

# ==================== Configuration & Setup ====================

class InterviewConfiguration(BaseModel):
    role: str = RoleEnum.SOFTWARE_ENGINEER
    custom_role: Optional[str] = None
    experience_level: ExperienceLevelEnum = ExperienceLevelEnum.FRESHER
    interview_type: InterviewTypeEnum = InterviewTypeEnum.TECHNICAL
    difficulty: DifficultyEnum = DifficultyEnum.MEDIUM
    num_questions: int = Field(default=5, ge=1, le=20)
    ai_provider: AIProviderEnum = AIProviderEnum.HYBRID
    feedback_mode: FeedbackModeEnum = FeedbackModeEnum.COACHING
    include_followup: bool = True
    max_followup: int = Field(default=3, ge=0, le=10)
    job_description: Optional[str] = None

# ==================== Question & Evaluation ====================

class InterviewQuestion(BaseModel):
    question_id: str
    question_number: int
    question_text: str
    topic: str
    category: str = "General"
    difficulty: DifficultyEnum = DifficultyEnum.MEDIUM
    rationale: Optional[str] = ""
    is_followup: bool = False
    followup_to_id: Optional[str] = None
    expected_key_concepts: List[str] = Field(default_factory=list)

class InterviewAnswer(BaseModel):
    question_id: str
    answer_text: str
    time_taken_seconds: Optional[int] = 0

class SubmitAnswerRequest(BaseModel):
    question_id: str
    answer_text: str
    time_taken_seconds: Optional[int] = 0

class AnswerEvaluation(BaseModel):
    question_id: str
    score: int = Field(ge=0, le=100)
    technical_correctness: int = Field(ge=0, le=40)
    relevance: int = Field(ge=0, le=25)
    clarity: int = Field(ge=0, le=20)
    practical_application: int = Field(ge=0, le=15)
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    missing_concepts: List[str] = Field(default_factory=list)
    ideal_answer: str
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    provider_used: Optional[str] = "AI"

class FollowUpDecision(BaseModel):
    action: FollowUpActionEnum
    reason: str
    follow_up_question: Optional[str] = None
    topic: Optional[str] = None
    target_difficulty: Optional[DifficultyEnum] = None
    should_end: bool = False

# ==================== Career Coach & Results ====================

class ImprovementPriority(BaseModel):
    priority_level: int = 1
    topic: str
    key_concepts_to_review: List[str] = Field(default_factory=list)
    action_items: List[str] = Field(default_factory=list)
    practical_exercises: List[str] = Field(default_factory=list)

class CareerImprovementPlan(BaseModel):
    overall_assessment: str
    priorities: List[ImprovementPriority] = Field(default_factory=list)
    recommended_resources: List[str] = Field(default_factory=list)
    mock_test_suggestions: List[str] = Field(default_factory=list)

class QAHistoryItem(BaseModel):
    question: InterviewQuestion
    answer: Optional[str] = ""
    evaluation: Optional[AnswerEvaluation] = None
    follow_up_decision: Optional[FollowUpDecision] = None
    answered_at: Optional[str] = None

class TopicScore(BaseModel):
    topic: str
    score: float
    questions_count: int
    correctness_avg: float
    relevance_avg: float

class InterviewResults(BaseModel):
    session_id: str
    candidate_name: str
    role: str
    interview_type: str
    difficulty: str
    overall_score: int
    total_questions_planned: int
    total_questions_answered: int
    correctness_score: int
    relevance_score: int
    clarity_score: int
    practical_score: int
    topic_breakdown: List[TopicScore] = Field(default_factory=list)
    strongest_topics: List[str] = Field(default_factory=list)
    improvement_areas: List[str] = Field(default_factory=list)
    qa_history: List[QAHistoryItem] = Field(default_factory=list)
    career_plan: Optional[CareerImprovementPlan] = None
    ai_provider_used: str
    duration_seconds: int = 0
    started_at: str
    completed_at: str
    disclaimer: str = "This score is an AI-generated evaluation for preparation purposes and should be treated as an estimate."

# ==================== Generic API Responses ====================

class ProviderStatus(BaseModel):
    provider: str
    available: bool
    model: str
    message: str

class ProvidersResponse(BaseModel):
    ollama: ProviderStatus
    gemini: ProviderStatus
    default_provider: str

class APIError(BaseModel):
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
