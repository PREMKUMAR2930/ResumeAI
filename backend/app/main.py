import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .config import settings
from .api import health, resume, interview, report

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("interviewready-ai")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Autonomous Resume-Based Interview Preparation Agent API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Setup - allow localhost and custom origins
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(report.router, prefix="/api")

def _get_cors_headers(request: Request):
    origin = request.headers.get("origin")
    return {
        "Access-Control-Allow-Origin": origin if origin else "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        headers=_get_cors_headers(request),
        content={
            "error_code": "VALIDATION_ERROR",
            "detail": "Invalid request payload format.",
            "message": "Invalid request payload format.",
            "details": {"errors": exc.errors()}
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {str(exc)}", exc_info=True)
    msg = str(exc) if str(exc) else "An unexpected error occurred during processing."
    return JSONResponse(
        status_code=500,
        headers=_get_cors_headers(request),
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "detail": msg,
            "message": msg,
            "details": None
        }
    )

@app.get("/")
async def root():
    return {
        "message": "Welcome to InterviewReady AI Backend API",
        "docs": "/docs",
        "health": "/api/health"
    }
