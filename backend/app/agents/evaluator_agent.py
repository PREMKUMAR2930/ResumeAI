from pathlib import Path
from ..services.ai_router import ai_router
from ..models.schemas import InterviewQuestion, AnswerEvaluation, AIProviderEnum

PROMPT_FILE = Path(__file__).parent.parent / "prompts" / "evaluator.txt"

class EvaluatorAgent:
    def __init__(self):
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            self.template = f.read()

    async def evaluate_answer(
        self,
        question: InterviewQuestion,
        candidate_answer: str,
        provider: AIProviderEnum = AIProviderEnum.HYBRID
    ) -> AnswerEvaluation:
        concepts_str = ", ".join(question.expected_key_concepts) if question.expected_key_concepts else "Core technical mastery"
        
        prompt = (
            self.template
            .replace("{question_text}", question.question_text)
            .replace("{topic}", question.topic)
            .replace("{difficulty}", question.difficulty.value)
            .replace("{expected_key_concepts}", concepts_str)
            .replace("{candidate_answer}", candidate_answer.strip() if candidate_answer else "[No answer submitted]")
        )

        parsed, provider_used = await ai_router.execute_structured_query(
            prompt=prompt,
            preferred_provider=provider,
            task_type="evaluation"
        )

        # Parse and sanitize rubric components
        raw_corr = parsed.get("technical_correctness", 25)
        raw_rel = parsed.get("relevance", 18)
        raw_cla = parsed.get("clarity", 14)
        raw_pra = parsed.get("practical_application", 8)

        # Clamp rubric scores to limits
        correctness = max(0, min(40, int(raw_corr)))
        relevance = max(0, min(25, int(raw_rel)))
        clarity = max(0, min(20, int(raw_cla)))
        practical = max(0, min(15, int(raw_pra)))
        
        total_score = correctness + relevance + clarity + practical

        strengths = parsed.get("strengths", ["Answer addressed the core question."])
        improvements = parsed.get("improvements", ["Provide deeper technical details and code examples."])
        missing = parsed.get("missing_concepts", [])
        ideal_answer = parsed.get("ideal_answer", "A comprehensive model answer covering principles, edge cases, and code trade-offs.")
        confidence = float(parsed.get("confidence", 0.88))

        return AnswerEvaluation(
            question_id=question.question_id,
            score=total_score,
            technical_correctness=correctness,
            relevance=relevance,
            clarity=clarity,
            practical_application=practical,
            strengths=strengths if isinstance(strengths, list) else [str(strengths)],
            improvements=improvements if isinstance(improvements, list) else [str(improvements)],
            missing_concepts=missing if isinstance(missing, list) else [str(missing)],
            ideal_answer=ideal_answer,
            confidence=confidence,
            provider_used=provider_used
        )

evaluator_agent = EvaluatorAgent()
