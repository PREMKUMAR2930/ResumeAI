from typing import List, Dict
from collections import defaultdict
from ..models.schemas import (
    QAHistoryItem,
    TopicScore,
    InterviewResults,
    CareerImprovementPlan
)
from ..models.session import InterviewSessionData

def compute_interview_results(session: InterviewSessionData) -> InterviewResults:
    """
    Computes comprehensive scoring and topic metrics from QA history.
    """
    answered_items = [item for item in session.qa_history if item.evaluation is not None]
    total_answered = len(answered_items)
    
    if total_answered == 0:
        return InterviewResults(
            session_id=session.session_id,
            candidate_name=session.resume_analysis.candidate_name if session.resume_analysis else "Candidate",
            role=session.config.role if session.config else "Software Engineer",
            interview_type=session.config.interview_type.value if session.config else "Technical",
            difficulty=session.config.difficulty.value if session.config else "Medium",
            overall_score=0,
            total_questions_planned=len(session.question_plan),
            total_questions_answered=0,
            correctness_score=0,
            relevance_score=0,
            clarity_score=0,
            practical_score=0,
            topic_breakdown=[],
            strongest_topics=[],
            improvement_areas=["No questions answered"],
            qa_history=session.qa_history,
            career_plan=session.career_plan,
            ai_provider_used=session.config.ai_provider.value if session.config else "hybrid",
            duration_seconds=int((session.updated_at - session.created_at).total_seconds()),
            started_at=session.created_at.isoformat(),
            completed_at=session.updated_at.isoformat()
        )

    # Accumulate metrics
    total_score_sum = sum(item.evaluation.score for item in answered_items)
    total_correctness = sum(item.evaluation.technical_correctness for item in answered_items)
    total_relevance = sum(item.evaluation.relevance for item in answered_items)
    total_clarity = sum(item.evaluation.clarity for item in answered_items)
    total_practical = sum(item.evaluation.practical_application for item in answered_items)

    overall_score = round(total_score_sum / total_answered)
    avg_correctness = round(total_correctness / total_answered)
    avg_relevance = round(total_relevance / total_answered)
    avg_clarity = round(total_clarity / total_answered)
    avg_practical = round(total_practical / total_answered)

    # Topic Breakdown
    topic_map = defaultdict(list)
    for item in answered_items:
        topic_name = item.question.topic or "General"
        topic_map[topic_name].append(item.evaluation)

    topic_breakdown: List[TopicScore] = []
    strongest_topics: List[str] = []
    improvement_areas: List[str] = []

    for topic, evals in topic_map.items():
        n = len(evals)
        t_score = sum(e.score for e in evals) / n
        t_corr = sum(e.technical_correctness for e in evals) / n
        t_rel = sum(e.relevance for e in evals) / n
        
        topic_breakdown.append(TopicScore(
            topic=topic,
            score=round(t_score, 1),
            questions_count=n,
            correctness_avg=round(t_corr, 1),
            relevance_avg=round(t_rel, 1)
        ))

        if t_score >= 75:
            strongest_topics.append(topic)
        elif t_score < 70:
            improvement_areas.append(topic)

    # Ensure at least some items if candidate scored consistently
    if not strongest_topics and topic_breakdown:
        best = max(topic_breakdown, key=lambda x: x.score)
        strongest_topics.append(best.topic)
    if not improvement_areas and topic_breakdown:
        lowest = min(topic_breakdown, key=lambda x: x.score)
        if lowest.score < 85:
            improvement_areas.append(lowest.topic)

    provider_used_list = list({item.evaluation.provider_used for item in answered_items if item.evaluation.provider_used})
    ai_provider_str = ", ".join(provider_used_list) if provider_used_list else (session.config.ai_provider.value if session.config else "AI")

    return InterviewResults(
        session_id=session.session_id,
        candidate_name=session.resume_analysis.candidate_name if session.resume_analysis else "Candidate",
        role=session.config.role if session.config else "Software Engineer",
        interview_type=session.config.interview_type.value if session.config else "Technical",
        difficulty=session.config.difficulty.value if session.config else "Medium",
        overall_score=overall_score,
        total_questions_planned=len(session.question_plan),
        total_questions_answered=total_answered,
        correctness_score=avg_correctness,
        relevance_score=avg_relevance,
        clarity_score=avg_clarity,
        practical_score=avg_practical,
        topic_breakdown=topic_breakdown,
        strongest_topics=strongest_topics,
        improvement_areas=improvement_areas,
        qa_history=session.qa_history,
        career_plan=session.career_plan,
        ai_provider_used=ai_provider_str,
        duration_seconds=int((session.updated_at - session.created_at).total_seconds()),
        started_at=session.created_at.isoformat(),
        completed_at=session.updated_at.isoformat()
    )
