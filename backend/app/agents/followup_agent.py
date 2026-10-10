from pathlib import Path
from ..services.ai_router import ai_router
from ..models.schemas import (
    InterviewQuestion,
    AnswerEvaluation,
    FollowUpDecision,
    FollowUpActionEnum,
    DifficultyEnum,
    AIProviderEnum,
    InterviewConfiguration
)

PROMPT_FILE = Path(__file__).parent.parent / "prompts" / "followup.txt"

class FollowUpAgent:
    def __init__(self):
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            self.template = f.read()

    async def decide_next_step(
        self,
        question: InterviewQuestion,
        candidate_answer: str,
        evaluation: AnswerEvaluation,
        current_question_num: int,
        total_questions: int,
        followup_count: int,
        config: InterviewConfiguration,
        is_already_followup: bool = False,
        provider: AIProviderEnum = AIProviderEnum.HYBRID
    ) -> FollowUpDecision:
        # Hard limits check
        if not config.include_followup or followup_count >= config.max_followup or is_already_followup:
            if current_question_num >= total_questions:
                return FollowUpDecision(
                    action=FollowUpActionEnum.END_INTERVIEW,
                    reason="Reached end of planned questions and follow-up limits.",
                    should_end=True
                )
            return FollowUpDecision(
                action=FollowUpActionEnum.NEXT_TOPIC,
                reason="Proceeding to next planned topic (follow-up limit reached or disabled).",
                should_end=False
            )

        prompt = (
            self.template
            .replace("{question_text}", str(question.question_text))
            .replace("{candidate_answer}", str(candidate_answer))
            .replace("{evaluation_score}", str(evaluation.score))
            .replace("{strengths}", ", ".join(evaluation.strengths))
            .replace("{missing_concepts}", ", ".join(evaluation.missing_concepts))
            .replace("{current_question_num}", str(current_question_num))
            .replace("{total_questions}", str(total_questions))
            .replace("{followup_count}", str(followup_count))
            .replace("{max_followup}", str(config.max_followup))
            .replace("{include_followup}", str(config.include_followup))
        )

        parsed, _ = await ai_router.execute_structured_query(
            prompt=prompt,
            preferred_provider=provider,
            task_type="followup"
        )

        raw_action = parsed.get("action", "next_topic")
        try:
            action_enum = FollowUpActionEnum(raw_action)
        except Exception:
            action_enum = FollowUpActionEnum.NEXT_TOPIC

        reason = parsed.get("reason", "Standard topic progression.")
        follow_up_q = parsed.get("follow_up_question")
        topic = parsed.get("topic", question.topic)
        should_end = (action_enum == FollowUpActionEnum.END_INTERVIEW) or (current_question_num >= total_questions and not follow_up_q)

        return FollowUpDecision(
            action=action_enum,
            reason=reason,
            follow_up_question=follow_up_q,
            topic=topic,
            should_end=should_end
        )

followup_agent = FollowUpAgent()
