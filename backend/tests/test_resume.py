import io
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app
from app.models.schemas import ResumeAnalysis, SkillEvidence, ProjectEvidence

client = TestClient(app)

def test_upload_txt_resume():
    content = b"John Doe\nSoftware Engineer\nSkills: Python, FastAPI, Docker, PostgreSQL\nProject: Cloud Task Optimizer using Python and React."
    file = io.BytesIO(content)
    
    response = client.post(
        "/api/resume/upload",
        files={"file": ("test_resume.txt", file, "text/plain")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "resume_id" in data
    assert "Python" in data["raw_text"]

def test_upload_invalid_file_extension():
    content = b"Binary executable content"
    file = io.BytesIO(content)
    response = client.post(
        "/api/resume/upload",
        files={"file": ("malicious.exe", file, "application/octet-stream")}
    )
    assert response.status_code == 400

@patch("app.agents.resume_agent.resume_agent.analyze", new_callable=AsyncMock)
def test_analyze_resume(mock_analyze):
    mock_analyze.return_value = ResumeAnalysis(
        candidate_name="Alex Rivera",
        skills=[
            SkillEvidence(name="Python", evidence="Listed under skills", confidence=0.98),
            SkillEvidence(name="FastAPI", evidence="Used in backend project", confidence=0.95)
        ],
        projects=[
            ProjectEvidence(name="Task Manager", technologies=["Python", "FastAPI"], possible_topics=["REST APIs", "Async IO"])
        ],
        programming_languages=["Python"],
        frameworks=["FastAPI"],
        databases=["PostgreSQL"],
        tools=["Docker"],
        recommended_topics=["Python Concurrency", "FastAPI Dependency Injection"]
    )

    response = client.post(
        "/api/resume/analyze",
        json={"resume_text": "Alex Rivera Python FastAPI developer with Docker and Postgres."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["candidate_name"] == "Alex Rivera"
    assert len(data["skills"]) == 2
    assert data["programming_languages"] == ["Python"]
