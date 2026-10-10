import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "InterviewReady AI" in data["app"]

def test_ai_providers_status():
    response = client.get("/api/ai/providers")
    assert response.status_code == 200
    data = response.json()
    assert "ollama" in data
    assert "gemini" in data
    assert "default_provider" in data
