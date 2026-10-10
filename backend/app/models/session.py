from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

from .schemas import (
    ResumeAnalysis,
    JobDescriptionAnalysis,
    InterviewConfiguration,
    InterviewQuestion,
    InterviewAnswer,
    AnswerEvaluation,
    FollowUpDecision,
    QAHistoryItem,
    CareerImprovementPlan,
    InterviewResults
)

class SessionState(str, Enum):
    CREATED = "CREATED"
    RESUME_ANALYZED = "RESUME_ANALYZED"
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    EVALUATING = "EVALUATING"
    FOLLOW_UP_PENDING = "FOLLOW_UP_PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AgentDecisionLog(BaseModel):
    agent_name: str
    action: str
    rationale: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: Dict[str, Any] = Field(default_factory=dict)

class InterviewSessionData(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    state: SessionState = SessionState.CREATED
    
    # Configuration & Inputs
    resume_id: Optional[str] = None
    resume_analysis: Optional[ResumeAnalysis] = None
    job_description_analysis: Optional[JobDescriptionAnalysis] = None
    config: Optional[InterviewConfiguration] = None
    
    # Question & Execution State
    question_plan: List[InterviewQuestion] = Field(default_factory=list)
    current_question_index: int = 0
    current_question: Optional[InterviewQuestion] = None
    
    # Progress & Limits
    followup_count: int = 0
    max_followup: int = 3
    is_current_followup: bool = False
    
    # History & Evals
    qa_history: List[QAHistoryItem] = Field(default_factory=list)
    agent_decisions: List[AgentDecisionLog] = Field(default_factory=list)
    
    # Completion
    career_plan: Optional[CareerImprovementPlan] = None
    results: Optional[InterviewResults] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    
    def touch(self):
        self.updated_at = datetime.now(timezone.utc)
        
    def add_decision(self, agent_name: str, action: str, rationale: str, metadata: Optional[Dict[str, Any]] = None):
        self.agent_decisions.append(AgentDecisionLog(
            agent_name=agent_name,
            action=action,
            rationale=rationale,
            metadata=metadata or {}
        ))
        self.touch()
