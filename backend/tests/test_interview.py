import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app
from app.models.schemas import (
    ResumeAnalysis,
    SkillEvidence,
    InterviewConfiguration,
    RoleEnum,
    DifficultyEnum,
    InterviewTypeEnum,
    AIProviderEnum,
    FeedbackModeEnum,
    InterviewQuestion,
    AnswerEvaluation,
    FollowUpDecision,
    FollowUpActionEnum
)

client = TestClient(app)

@patch("app.agents.interview_planner_agent.interview_planner_agent.create_plan", new_callable=AsyncMock)
def test_create_interview_session(mock_plan):
    mock_plan.return_value = [
        InterviewQuestion(
            question_id="q1",
            question_number=1,
            question_text="Explain Python GIL and how it affects multithreading.",
            topic="Python Concurrency",
            difficulty=DifficultyEnum.MEDIUM,
            expected_key_concepts=["Global Interpreter Lock", "CPU bound vs I/O bound"]
        )
    ]

    payload = {
        "resume_analysis": {
            "candidate_name": "Jane Doe",
            "skills": [{"name": "Python", "evidence": "Resume", "confidence": 0.95}],
            "programming_languages": ["Python"],
            "projects": [],
            "missing_information": [],
            "recommended_topics": ["Python Concurrency"]
        },
        "config": {
            "role": "Python Developer",
            "experience_level": "Fresher",
            "interview_type": "Technical",
            "difficulty": "Medium",
            "num_questions": 1,
            "ai_provider": "hybrid",
            "feedback_mode": "coaching",
            "include_followup": True,
            "max_followup": 2
        }
    }

    response = client.post("/api/interviews", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["state"] == "IN_PROGRESS"
    assert len(data["question_plan"]) == 1
    assert data["current_question"]["question_text"] == "Explain Python GIL and how it affects multithreading."

    session_id = data["session_id"]

    # Test GET session
    get_resp = client.get(f"/api/interviews/{session_id}")
    assert get_resp.status_code == 200

    # Test GET current question
    q_resp = client.get(f"/api/interviews/{session_id}/question")
    assert q_resp.status_code == 200
    assert q_resp.json()["question_id"] == "q1"
