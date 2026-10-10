from datetime import datetime, timezone
from fastapi import APIRouter
from ..config import settings
from ..services.ai_router import ai_router
from ..services.ollama_service import ollama_service
from ..models.schemas import ProvidersResponse

router = APIRouter(tags=["Health & AI Status"])

@router.get("/health")
async def get_health():
    """Returns application health and version information."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/ai/providers", response_model=ProvidersResponse)
async def get_ai_providers_status():
    """Returns availability status for Ollama and Gemini AI providers."""
    return await ai_router.get_providers_status()

@router.get("/ai/ollama/models")
async def get_ollama_models():
    """Returns list of installed models on local Ollama service."""
    is_avail, models, msg = await ollama_service.check_availability()
    return {
        "available": is_avail,
        "models": models,
        "message": msg
    }
