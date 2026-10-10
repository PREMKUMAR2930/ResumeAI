import pytest
from unittest.mock import patch, AsyncMock
from app.models.schemas import (
    InterviewQuestion,
    DifficultyEnum,
    AIProviderEnum
)
from app.agents.evaluator_agent import evaluator_agent

@pytest.mark.asyncio
async def test_evaluator_score_consistency():
    q = InterviewQuestion(
        question_id="q-test-1",
        question_number=1,
        question_text="What is the difference between an abstract class and an interface in Java?",
        topic="Java OOP",
        difficulty=DifficultyEnum.MEDIUM,
        expected_key_concepts=["Multiple inheritance", "Method implementations", "Default methods"]
    )
    answer = "An abstract class can provide default implementation and state, while an interface is primarily a contract with method signatures, though modern Java allows default methods."

    mock_llm_dict = {
        "technical_correctness": 36,
        "relevance": 23,
        "clarity": 18,
        "practical_application": 12,
        "strengths": ["Accurate comparison", "Mentioned default methods"],
        "improvements": ["Give a quick code snippet"],
        "missing_concepts": [],
        "ideal_answer": "Model answer",
        "confidence": 0.95
    }

    with patch("app.services.ai_router.ai_router.execute_structured_query", new_callable=AsyncMock) as mock_query:
        mock_query.return_value = (mock_llm_dict, "Gemini (Mock)")
        result = await evaluator_agent.evaluate_answer(q, answer, AIProviderEnum.HYBRID)

        assert result.question_id == "q-test-1"
        assert result.technical_correctness == 36
        assert result.relevance == 23
        assert result.clarity == 18
        assert result.practical_application == 12
        assert result.score == 36 + 23 + 18 + 12 # 89
        assert "Accurate comparison" in result.strengths
