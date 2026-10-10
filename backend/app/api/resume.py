import os
import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from pydantic import BaseModel
from typing import Optional

from ..config import settings
from ..utils.file_validation import validate_uploaded_file, get_temp_file_path, delete_temp_file
from ..services.resume_parser import parse_resume_file
from ..agents.resume_agent import resume_agent
from ..services.ai_router import ai_router
from ..models.schemas import ResumeAnalysis, JobDescriptionAnalysis, MatchItem, AIProviderEnum

router = APIRouter(prefix="/resume", tags=["Resume & Job Description"])

class AnalyzeResumeRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None
    ai_provider: AIProviderEnum = AIProviderEnum.HYBRID

class MatchJobRequest(BaseModel):
    resume_analysis: ResumeAnalysis
    job_description: str
    ai_provider: AIProviderEnum = AIProviderEnum.HYBRID

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Uploads, validates, and extracts text from PDF, DOCX, or TXT resume.
    Enforces maximum size limit (5MB).
    """
    resume_id, safe_filename = validate_uploaded_file(file)
    file_path = get_temp_file_path(safe_filename)

    # Read and check size
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Write temporarily
    with open(file_path, "wb") as f:
        f.write(contents)

    # Extract text
    raw_text, preview = parse_resume_file(file_path)

    return {
        "resume_id": resume_id,
        "filename": file.filename,
        "size_bytes": len(contents),
        "raw_text": raw_text,
        "preview": preview,
        "message": "Resume uploaded and text extracted successfully."
    }

@router.post("/analyze", response_model=ResumeAnalysis)
async def analyze_resume(request: AnalyzeResumeRequest):
    """
    Extracts structured technical skills, projects, and evidence from resume text using AI.
    """
    text = request.resume_text
    if not text and request.resume_id:
        temp_dir = Path(settings.TEMP_STORAGE_DIR)
        for f in temp_dir.glob(f"{request.resume_id}.*"):
            text, _ = parse_resume_file(f)
            break

    if not text:
        raise HTTPException(status_code=400, detail="No resume text or valid resume_id provided.")

    try:
        analysis = await resume_agent.analyze(resume_text=text, provider=request.ai_provider)
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        status_code = 503 if "No AI providers" in str(e) or "not configured" in str(e) else 500
        raise HTTPException(status_code=status_code, detail=str(e))

def _normalize_match_items(items, default_status="supported"):
    res = []
    for item in items or []:
        if isinstance(item, dict):
            res.append(MatchItem(
                skill=str(item.get("skill") or item.get("name") or "Skill"),
                evidence=str(item.get("evidence") or "Matched from context"),
                status=str(item.get("status") or default_status)
            ))
        elif isinstance(item, str):
            res.append(MatchItem(
                skill=item,
                evidence="Identified requirement",
                status=default_status
            ))
    return res

@router.post("/match-job", response_model=JobDescriptionAnalysis)
async def match_job_description(request: MatchJobRequest):
    """
    Compares candidate's extracted resume evidence against a target job description.
    """
    if not request.job_description or len(request.job_description.strip()) < 10:
        raise HTTPException(status_code=400, detail="Please provide a valid job description.")

    prompt_path = Path(__file__).parent.parent / "prompts" / "job_match.txt"
    with open(prompt_path, "r", encoding="utf-8") as f:
        template = f.read()

    prompt = (
        template
        .replace("{job_description}", request.job_description)
        .replace("{resume_analysis_json}", json.dumps(request.resume_analysis.model_dump(), indent=2))
    )

    try:
        parsed, _ = await ai_router.execute_structured_query(
            prompt=prompt,
            preferred_provider=request.ai_provider,
            task_type="resume"
        )

        return JobDescriptionAnalysis(
            job_title=parsed.get("job_title", "Target Role"),
            required_skills=parsed.get("required_skills", []) if isinstance(parsed.get("required_skills"), list) else [],
            preferred_skills=parsed.get("preferred_skills", []) if isinstance(parsed.get("preferred_skills"), list) else [],
            responsibilities=parsed.get("responsibilities", []) if isinstance(parsed.get("responsibilities"), list) else [],
            experience_expectations=parsed.get("experience_expectations", "") or "",
            matched_skills=_normalize_match_items(parsed.get("matched_skills"), "supported"),
            partial_skills=_normalize_match_items(parsed.get("partial_skills"), "partial"),
            missing_skills=_normalize_match_items(parsed.get("missing_skills"), "missing"),
            interview_focus_areas=parsed.get("interview_focus_areas", []) if isinstance(parsed.get("interview_focus_areas"), list) else []
        )
    except HTTPException:
        raise
    except Exception as e:
        status_code = 503 if "No AI providers" in str(e) or "not configured" in str(e) else 500
        raise HTTPException(status_code=status_code, detail=str(e))

@router.delete("/{resume_id}")
async def delete_resume(resume_id: str):
    """Deletes temporary uploaded resume file."""
    delete_temp_file(resume_id)
    return {"message": f"Resume {resume_id} deleted successfully."}
