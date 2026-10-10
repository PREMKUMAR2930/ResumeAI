import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from ..config import settings

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/msword",
    "application/octet-stream"  # Some systems send octet-stream for docx/pdf
}

def validate_uploaded_file(file: UploadFile) -> str:
    """
    Validates the uploaded file extension and returns a unique safe filename.
    Raises HTTPException if invalid.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file has no filename.")
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: PDF, DOCX, TXT."
        )
    
    # Generate unique resume ID
    resume_id = str(uuid.uuid4())
    safe_filename = f"{resume_id}{file_ext}"
    return resume_id, safe_filename

def get_temp_file_path(filename: str) -> Path:
    """Returns absolute path inside the configured temp storage directory."""
    return Path(settings.TEMP_STORAGE_DIR) / filename

def delete_temp_file(resume_id: str):
    """Deletes temporary file matching the resume_id."""
    temp_dir = Path(settings.TEMP_STORAGE_DIR)
    for file in temp_dir.glob(f"{resume_id}.*"):
        try:
            if file.is_file():
                file.unlink(missing_ok=True)
        except Exception:
            pass
