from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from ..services.session_manager import session_manager
from ..agents.orchestrator import orchestrator
from ..services.pdf_report_service import generate_pdf_report

router = APIRouter(prefix="/interviews", tags=["Reports & Exports"])

@router.get("/{session_id}/report/pdf")
async def download_pdf_report(session_id: str):
    """Generates and downloads a clean, professional PDF interview report."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
        
    results = session.results
    if not results:
        results = await orchestrator.finalize_interview(session)

    pdf_buffer = generate_pdf_report(results)
    candidate_clean = "".join([c if c.isalnum() else "_" for c in results.candidate_name])
    filename = f"InterviewReady_Report_{candidate_clean}_{session_id[:8]}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@router.get("/{session_id}/report/json")
async def export_json_report(session_id: str):
    """Exports structured interview results and QA history as JSON."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
        
    results = session.results
    if not results:
        results = await orchestrator.finalize_interview(session)

    return JSONResponse(content=results.model_dump())
