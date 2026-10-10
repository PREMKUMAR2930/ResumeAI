import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "InterviewReady AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # AI Providers Configuration
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", description="Base URL for local Ollama instance")
    OLLAMA_MODEL: str = Field(default="llama3", description="Default Ollama model name")
    
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")
    GEMINI_MODEL: str = Field(default="gemini-3.5-flash", description="Gemini Model Identifier")
    
    DEFAULT_AI_PROVIDER: str = Field(default="gemini", description="Default provider: ollama, gemini, or hybrid")
    
    # Frontend CORS
    FRONTEND_ORIGIN: str = Field(default="http://localhost:5173", description="Allowed CORS origin for React frontend")
    
    # Security & Storage
    MAX_UPLOAD_SIZE_MB: int = Field(default=5, description="Maximum resume upload size in Megabytes")
    INTERVIEW_SESSION_TTL_MINUTES: int = Field(default=120, description="Session time to live in minutes")
    MAX_FOLLOW_UP_QUESTIONS: int = Field(default=5, description="Default max follow-up questions per session")
    TEMP_STORAGE_DIR: str = Field(default=str(BASE_DIR / "temp_resumes"), description="Temporary resume storage folder")
    
    # Timeouts
    AI_REQUEST_TIMEOUT_SECONDS: float = Field(default=60.0, description="Timeout for external LLM API calls")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()

# Ensure temp storage directory exists
os.makedirs(settings.TEMP_STORAGE_DIR, exist_ok=True)
