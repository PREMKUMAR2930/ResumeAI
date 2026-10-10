from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional

from ..models.schemas import (
    ResumeAnalysis,
    JobDescriptionAnalysis,
    InterviewConfiguration,
    InterviewQuestion,
    SubmitAnswerRequest,
    AnswerEvaluation,
    FollowUpDecision,
    InterviewResults
)
from ..models.session import InterviewSessionData
from ..services.session_manager import session_manager
from ..agents.orchestrator import orchestrator

router = APIRouter(prefix="/interviews", tags=["Interview Lifecycle"])

class CreateInterviewRequest(BaseModel):
    resume_analysis: ResumeAnalysis
    config: InterviewConfiguration
    job_description_analysis: Optional[JobDescriptionAnalysis] = None

class AnswerResponse(BaseModel):
    session_id: str
    evaluation: AnswerEvaluation
    follow_up_decision: FollowUpDecision
    next_question: Optional[InterviewQuestion] = None
    is_completed: bool
    state: str

@router.post("", response_model=InterviewSessionData)
async def create_interview(request: CreateInterviewRequest):
    """
    Creates a new autonomous interview session, plans questions based on candidate's resume,
    and stages the first question.
    """
    try:
        session = await orchestrator.initialize_interview(
            resume_analysis=request.resume_analysis,
            config=request.config,
            job_analysis=request.job_description_analysis
        )
        return session
    except HTTPException:
        raise
    except Exception as e:
        status_code = 503 if "No AI providers" in str(e) or "not configured" in str(e) else 500
        raise HTTPException(status_code=status_code, detail=str(e))

@router.get("/{session_id}", response_model=InterviewSessionData)
async def get_interview_session(session_id: str):
    """Returns the current state and question progress of an interview session."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found or expired.")
    return session

@router.get("/{session_id}/question", response_model=Optional[InterviewQuestion])
async def get_current_question(session_id: str):
    """Retrieves the active question to be answered by the candidate."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found or expired.")
    return session.current_question

@router.post("/{session_id}/answer", response_model=AnswerResponse)
async def submit_answer(session_id: str, request: SubmitAnswerRequest):
    """
    Submits candidate's answer for evaluation, assesses technical correctness,
    generates adaptive follow-up questions if needed, and updates state.
    """
    if not request.answer_text or len(request.answer_text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")

    try:
        session, eval_result, decision = await orchestrator.process_answer(
            session_id=session_id,
            question_id=request.question_id,
            answer_text=request.answer_text,
            time_taken_seconds=request.time_taken_seconds or 0
        )

        is_done = session.state == "COMPLETED" or session.current_question is None

        return AnswerResponse(
            session_id=session_id,
            evaluation=eval_result,
            follow_up_decision=decision,
            next_question=session.current_question,
            is_completed=is_done,
            state=session.state.value
        )
    except HTTPException:
        raise
    except Exception as e:
        status_code = 503 if "No AI providers" in str(e) or "not configured" in str(e) else 500
        raise HTTPException(status_code=status_code, detail=str(e))

@router.post("/{session_id}/next", response_model=Optional[InterviewQuestion])
async def advance_question(session_id: str):
    """Manually moves to the next question when in a coaching mode review."""
    try:
        next_q = await orchestrator.advance_to_next(session_id)
        return next_q
    except HTTPException:
        raise
    except Exception as e:
        status_code = 503 if "No AI providers" in str(e) or "not configured" in str(e) else 500
        raise HTTPException(status_code=status_code, detail=str(e))

@router.post("/{session_id}/finish", response_model=InterviewResults)
async def finish_interview(session_id: str):
    """
    Concludes the interview early or normally, computes composite scores,
    and runs the Career Coach Agent for a customized improvement plan.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found or expired.")
        
    try:
        results = await orchestrator.finalize_interview(session)
        return results
    except HTTPException:
        raise
    except Exception as e:
        status_code = 503 if "No AI providers" in str(e) or "not configured" in str(e) else 500
        raise HTTPException(status_code=status_code, detail=str(e))

@router.get("/{session_id}/results", response_model=InterviewResults)
async def get_interview_results(session_id: str):
    """Retrieves the final results, rubric breakdown, and career coach roadmap."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found or expired.")
        
    try:
        if not session.results:
            # Finalize if not yet finalized
            results = await orchestrator.finalize_interview(session)
            return results
            
        return session.results
    except HTTPException:
        raise
    except Exception as e:
        status_code = 503 if "No AI providers" in str(e) or "not configured" in str(e) else 500
        raise HTTPException(status_code=status_code, detail=str(e))

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Terminates and purges the session data from memory."""
    deleted = session_manager.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"message": f"Session {session_id} deleted."}
