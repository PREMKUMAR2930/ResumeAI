from pathlib import Path
from typing import List
from ..services.ai_router import ai_router
from ..models.schemas import (
    CareerImprovementPlan,
    ImprovementPriority,
    QAHistoryItem,
    InterviewConfiguration,
    TopicScore,
    AIProviderEnum
)

PROMPT_FILE = Path(__file__).parent.parent / "prompts" / "career_coach.txt"

class CareerCoachAgent:
    def __init__(self):
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            self.template = f.read()

    async def generate_plan(
        self,
        qa_history: List[QAHistoryItem],
        topic_scores: List[TopicScore],
        overall_score: int,
        config: InterviewConfiguration,
        provider: AIProviderEnum = AIProviderEnum.HYBRID
    ) -> CareerImprovementPlan:
        # Build QA summary
        qa_lines = []
        for idx, item in enumerate(qa_history, 1):
            score = item.evaluation.score if item.evaluation else "N/A"
            strengths = ", ".join(item.evaluation.strengths) if item.evaluation else "N/A"
            missing = ", ".join(item.evaluation.missing_concepts) if item.evaluation else "N/A"
            qa_lines.append(
                f"Q{idx} [{item.question.topic} - Score {score}/100]: {item.question.question_text}\n"
                f"Answer: {item.answer}\n"
                f"Strengths: {strengths} | Gaps: {missing}"
            )
        qa_summary = "\n\n".join(qa_lines)
        topic_summary = ", ".join([f"{t.topic}: {t.score}%" for t in topic_scores])

        prompt = (
            self.template
            .replace("{role}", str(config.role))
            .replace("{experience_level}", str(config.experience_level.value))
            .replace("{overall_score}", str(overall_score))
            .replace("{topic_scores}", str(topic_summary))
            .replace("{qa_summary}", str(qa_summary))
        )

        parsed, _ = await ai_router.execute_structured_query(
            prompt=prompt,
            preferred_provider=provider,
            task_type="coaching"
        )

        overall_assessment = parsed.get("overall_assessment", "Good technical interview baseline. Continue practicing system trade-offs and code implementation.")
        raw_priorities = parsed.get("priorities", [])
        
        priorities: List[ImprovementPriority] = []
        for idx, p in enumerate(raw_priorities, 1):
            if isinstance(p, dict):
                priorities.append(ImprovementPriority(
                    priority_level=int(p.get("priority_level", idx)),
                    topic=p.get("topic", f"Priority {idx}"),
                    key_concepts_to_review=p.get("key_concepts_to_review", []),
                    action_items=p.get("action_items", []),
                    practical_exercises=p.get("practical_exercises", [])
                ))

        if not priorities:
            priorities.append(ImprovementPriority(
                priority_level=1,
                topic="Core Role Fundamentals",
                key_concepts_to_review=["Core concepts", "Design patterns"],
                action_items=["Revise standard documentation", "Practice answering with structured STAR/code examples"],
                practical_exercises=["Build an end-to-end sample project and explain its architecture aloud"]
            ))

        return CareerImprovementPlan(
            overall_assessment=overall_assessment,
            priorities=priorities,
            recommended_resources=parsed.get("recommended_resources", [
                "LeetCode Interview Practice",
                "Official Framework Documentation",
                "Designing Data-Intensive Applications by Martin Kleppmann"
            ]),
            mock_test_suggestions=parsed.get("mock_test_suggestions", [
                "Practice 30-minute timed mock tests for high-pressure technical questions"
            ])
        )

career_coach_agent = CareerCoachAgent()
