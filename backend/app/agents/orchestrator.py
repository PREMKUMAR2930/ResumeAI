import uuid
import logging
from datetime import datetime, timezone
from typing import Tuple, Optional
from fastapi import HTTPException

from ..models.session import InterviewSessionData, SessionState
from ..models.schemas import (
    InterviewConfiguration,
    ResumeAnalysis,
    JobDescriptionAnalysis,
    InterviewQuestion,
    AnswerEvaluation,
    FollowUpDecision,
    QAHistoryItem,
    InterviewResults,
    FollowUpActionEnum
)
from ..services.session_manager import session_manager
from ..services.scoring_service import compute_interview_results
from .resume_agent import resume_agent
from .interview_planner_agent import interview_planner_agent
from .interviewer_agent import interviewer_agent
from .evaluator_agent import evaluator_agent
from .followup_agent import followup_agent
from .career_coach_agent import career_coach_agent

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """
    Central state machine and coordinator for InterviewReady AI.
    """

    async def initialize_interview(
        self,
        resume_analysis: ResumeAnalysis,
        config: InterviewConfiguration,
        job_analysis: Optional[JobDescriptionAnalysis] = None
    ) -> InterviewSessionData:
        """
        Creates session, plans questions using AI, and sets up first question.
        """
        session = InterviewSessionData(
            resume_analysis=resume_analysis,
            config=config,
            job_description_analysis=job_analysis,
            max_followup=config.max_followup,
            state=SessionState.CREATED
        )

        session.add_decision(
            agent_name="Orchestrator",
            action="INITIALIZE",
            rationale="Started new interview session with user configuration."
        )

        # Plan interview
        session.state = SessionState.PLANNED
        questions = await interview_planner_agent.create_plan(
            resume_analysis=resume_analysis,
            config=config,
            job_analysis=job_analysis,
            provider=config.ai_provider
        )

        session.question_plan = questions
        session.current_question_index = 0
        if questions:
            session.current_question = questions[0]
            session.state = SessionState.IN_PROGRESS

        session.add_decision(
            agent_name="InterviewPlannerAgent",
            action="PLAN_CREATED",
            rationale=f"Generated {len(questions)} tailored interview questions."
        )

        session_manager.create_session(session)
        return session

    async def process_answer(
        self,
        session_id: str,
        question_id: str,
        answer_text: str,
        time_taken_seconds: int = 0
    ) -> Tuple[InterviewSessionData, AnswerEvaluation, FollowUpDecision]:
        """
        Processes answer submission, evaluates correctness, triggers follow-up decision,
        and manages session state.
        """
        session = session_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found or expired.")

        if session.state in (SessionState.COMPLETED, SessionState.FAILED):
            raise HTTPException(status_code=400, detail="Interview is already completed.")

        # Validate current question
        current_q = session.current_question
        if not current_q or current_q.question_id != question_id:
            raise HTTPException(status_code=400, detail="Question ID mismatch or out of sequence.")

        # Prevent duplicate evaluation
        session.state = SessionState.EVALUATING

        # 1. Evaluate answer
        eval_result = await evaluator_agent.evaluate_answer(
            question=current_q,
            candidate_answer=answer_text,
            provider=session.config.ai_provider
        )

        session.add_decision(
            agent_name="EvaluatorAgent",
            action="ANSWER_EVALUATED",
            rationale=f"Score: {eval_result.score}/100. Correctness: {eval_result.technical_correctness}/40.",
            metadata={"question_id": question_id, "score": eval_result.score}
        )

        # 2. Decide Follow-Up or Next Step
        is_followup_q = current_q.is_followup
        total_planned = len(session.question_plan)
        current_q_num = current_q.question_number

        decision = await followup_agent.decide_next_step(
            question=current_q,
            candidate_answer=answer_text,
            evaluation=eval_result,
            current_question_num=current_q_num,
            total_questions=total_planned,
            followup_count=session.followup_count,
            config=session.config,
            is_already_followup=is_followup_q,
            provider=session.config.ai_provider
        )

        # Record QA history
        qa_item = QAHistoryItem(
            question=current_q,
            answer=answer_text,
            evaluation=eval_result,
            follow_up_decision=decision,
            answered_at=datetime.now(timezone.utc).isoformat()
        )
        session.qa_history.append(qa_item)

        session.add_decision(
            agent_name="FollowUpAgent",
            action=f"DECISION_{decision.action.value.upper()}",
            rationale=decision.reason,
            metadata={"should_end": decision.should_end, "has_followup": bool(decision.follow_up_question)}
        )

        # 3. Handle next state / question transition
        if decision.follow_up_question and session.followup_count < session.max_followup:
            session.followup_count += 1
            follow_up_obj = InterviewQuestion(
                question_id=str(uuid.uuid4()),
                question_number=current_q.question_number,
                question_text=decision.follow_up_question,
                topic=decision.topic or current_q.topic,
                category="Adaptive Follow-Up",
                difficulty=decision.target_difficulty or current_q.difficulty,
                rationale=decision.reason,
                is_followup=True,
                followup_to_id=current_q.question_id,
                expected_key_concepts=[]
            )
            session.current_question = follow_up_obj
            session.is_current_followup = True
            session.state = SessionState.FOLLOW_UP_PENDING
        else:
            # Advance to next planned question or finish
            session.is_current_followup = False
            session.current_question_index += 1
            if session.current_question_index < len(session.question_plan) and not decision.should_end:
                session.current_question = session.question_plan[session.current_question_index]
                session.state = SessionState.IN_PROGRESS
            else:
                session.current_question = None
                # Auto-finish if questions are exhausted
                await self.finalize_interview(session)

        session_manager.update_session(session)
        return session, eval_result, decision

    async def advance_to_next(self, session_id: str) -> Optional[InterviewQuestion]:
        """Manually advance to next question when in a pending state."""
        session = session_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")
            
        if session.current_question:
            return session.current_question
            
        if session.current_question_index < len(session.question_plan):
            session.current_question = session.question_plan[session.current_question_index]
            session.state = SessionState.IN_PROGRESS
            session_manager.update_session(session)
            return session.current_question
            
        # Finish if no more questions
        await self.finalize_interview(session)
        session_manager.update_session(session)
        return None

    async def finalize_interview(self, session: InterviewSessionData) -> InterviewResults:
        """Synthesizes scores, runs Career Coach Agent, and marks session as COMPLETED."""
        if session.state == SessionState.COMPLETED and session.results:
            return session.results

        # Calculate preliminary results
        results = compute_interview_results(session)

        # Run Career Coach Agent
        career_plan = await career_coach_agent.generate_plan(
            qa_history=session.qa_history,
            topic_scores=results.topic_breakdown,
            overall_score=results.overall_score,
            config=session.config,
            provider=session.config.ai_provider
        )

        session.career_plan = career_plan
        results.career_plan = career_plan
        session.results = results
        session.state = SessionState.COMPLETED
        session.completed_at = datetime.now(timezone.utc)

        session.add_decision(
            agent_name="CareerCoachAgent",
            action="CAREER_PLAN_GENERATED",
            rationale="Synthesized topic performance and generated personalized 3-tier roadmap."
        )

        session_manager.update_session(session)
        return results

orchestrator = AgentOrchestrator()
