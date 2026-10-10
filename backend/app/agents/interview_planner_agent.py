from pathlib import Path
from typing import List
import uuid
from ..services.ai_router import ai_router
from ..models.schemas import (
    ResumeAnalysis,
    InterviewConfiguration,
    InterviewQuestion,
    DifficultyEnum,
    AIProviderEnum,
    JobDescriptionAnalysis
)

PROMPT_FILE = Path(__file__).parent.parent / "prompts" / "interview_planner.txt"

class InterviewPlannerAgent:
    def __init__(self):
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            self.template = f.read()

    async def create_plan(
        self,
        resume_analysis: ResumeAnalysis,
        config: InterviewConfiguration,
        job_analysis: JobDescriptionAnalysis = None,
        provider: AIProviderEnum = AIProviderEnum.HYBRID
    ) -> List[InterviewQuestion]:
        # Build resume summary string
        skills_str = ", ".join([s.name for s in resume_analysis.skills])
        projects_str = "; ".join([f"{p.name} ({', '.join(p.technologies)})" for p in resume_analysis.projects])
        resume_summary = (
            f"Candidate: {resume_analysis.candidate_name}\n"
            f"Skills: {skills_str}\n"
            f"Projects: {projects_str}\n"
            f"Recommended Topics: {', '.join(resume_analysis.recommended_topics)}"
        )

        job_context = "No specific job description provided; tailor questions to target role."
        if job_analysis and job_analysis.job_title:
            job_context = (
                f"Target Job: {job_analysis.job_title}\n"
                f"Required: {', '.join(job_analysis.required_skills)}\n"
                f"Focus Areas: {', '.join(job_analysis.interview_focus_areas)}"
            )

        role_name = config.custom_role if (config.role == "Custom" and config.custom_role) else config.role

        prompt = (
            self.template
            .replace("{role}", str(role_name))
            .replace("{experience_level}", str(config.experience_level.value))
            .replace("{interview_type}", str(config.interview_type.value))
            .replace("{difficulty}", str(config.difficulty.value))
            .replace("{num_questions}", str(config.num_questions))
            .replace("{resume_summary}", str(resume_summary))
            .replace("{job_context}", str(job_context))
        )

        parsed, _ = await ai_router.execute_structured_query(
            prompt=prompt,
            preferred_provider=provider,
            task_type="plan"
        )

        raw_questions = parsed.get("questions", [])
        questions: List[InterviewQuestion] = []
        
        for idx, q in enumerate(raw_questions, 1):
            if isinstance(q, dict) and q.get("question_text"):
                diff_val = q.get("difficulty", config.difficulty.value)
                try:
                    diff_enum = DifficultyEnum(diff_val.capitalize())
                except Exception:
                    diff_enum = config.difficulty

                questions.append(InterviewQuestion(
                    question_id=str(uuid.uuid4()),
                    question_number=idx,
                    question_text=q.get("question_text"),
                    topic=q.get("topic", "General Technical"),
                    category=q.get("category", "Core"),
                    difficulty=diff_enum,
                    rationale=q.get("rationale", ""),
                    is_followup=False,
                    followup_to_id=None,
                    expected_key_concepts=q.get("expected_key_concepts", [])
                ))

        # Guarantee at least some questions if LLM provided fewer than configured
        if len(questions) < config.num_questions and len(questions) > 0:
            pass # Use whatever high-quality questions were returned
        elif not questions:
            # Fallback question set
            questions.append(InterviewQuestion(
                question_id=str(uuid.uuid4()),
                question_number=1,
                question_text=f"Could you walk me through the architecture and key technical challenges of one of your recent projects?",
                topic="Project Architecture",
                category="Practical",
                difficulty=config.difficulty,
                rationale="Candidate background exploration",
                expected_key_concepts=["Architecture", "Database", "Design Decisions"]
            ))

        return questions

interview_planner_agent = InterviewPlannerAgent()
