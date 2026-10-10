import io
from app.models.schemas import (
    InterviewResults,
    TopicScore,
    QAHistoryItem,
    InterviewQuestion,
    AnswerEvaluation,
    CareerImprovementPlan,
    ImprovementPriority,
    DifficultyEnum
)
from app.services.pdf_report_service import generate_pdf_report

def test_generate_pdf_report_stream():
    q = InterviewQuestion(
        question_id="q1",
        question_number=1,
        question_text="Describe how Docker containerization improves application deployment.",
        topic="DevOps & Docker",
        difficulty=DifficultyEnum.MEDIUM,
        expected_key_concepts=["Container isolation", "Reproducibility", "Image layers"]
    )
    eval_item = AnswerEvaluation(
        question_id="q1",
        score=85,
        technical_correctness=35,
        relevance=22,
        clarity=18,
        practical_application=10,
        strengths=["Clear explanation of isolated namespaces and cgroups"],
        improvements=["Could mention Kubernetes orchestration"],
        missing_concepts=[],
        ideal_answer="Docker packages software into standard containers for consistent environments across dev and prod.",
        confidence=0.92,
        provider_used="Gemini 1.5 Flash"
    )

    results = InterviewResults(
        session_id="test-session-12345678",
        candidate_name="Priya Sharma",
        role="Full-Stack Developer",
        interview_type="Technical",
        difficulty="Medium",
        overall_score=85,
        total_questions_planned=1,
        total_questions_answered=1,
        correctness_score=35,
        relevance_score=22,
        clarity_score=18,
        practical_score=10,
        topic_breakdown=[
            TopicScore(topic="DevOps & Docker", score=85.0, questions_count=1, correctness_avg=35.0, relevance_avg=22.0)
        ],
        strongest_topics=["DevOps & Docker"],
        improvement_areas=[],
        qa_history=[
            QAHistoryItem(question=q, answer="Docker encapsulates apps in lightweight containers.", evaluation=eval_item)
        ],
        career_plan=CareerImprovementPlan(
            overall_assessment="Solid practical understanding with good technical communication.",
            priorities=[
                ImprovementPriority(
                    priority_level=1,
                    topic="Container Orchestration",
                    key_concepts_to_review=["Kubernetes Pods", "Deployments", "Services"],
                    action_items=["Complete Minikube tutorial", "Configure a multi-tier microservice"],
                    practical_exercises=["Write a Helm chart for your full-stack application"]
                )
            ]
        ),
        ai_provider_used="Gemini 1.5 Flash",
        duration_seconds=120,
        started_at="2026-10-09T10:00:00Z",
        completed_at="2026-10-09T10:02:00Z"
    )

    pdf_buffer = generate_pdf_report(results)
    assert isinstance(pdf_buffer, io.BytesIO)
    content = pdf_buffer.getvalue()
    assert len(content) > 1000
    assert content.startswith(b"%PDF")
