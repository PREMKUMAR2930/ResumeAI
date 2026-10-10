# InterviewReady AI — FastAPI Backend Service

This directory contains the Python FastAPI backend and autonomous multi-agent orchestration engine for **InterviewReady AI**.

---

## 1. Directory Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app entrypoint, middleware & route registration
│   ├── config.py                # Pydantic BaseSettings config
│   ├── api/
│   │   ├── health.py            # /api/health & /api/ai/providers
│   │   ├── resume.py            # /api/resume/upload, /analyze, /match-job
│   │   ├── interview.py         # /api/interviews lifecycle
│   │   └── report.py            # /api/interviews/{id}/report/pdf & json
│   ├── agents/
│   │   ├── orchestrator.py      # Main coordinator & state machine
│   │   ├── resume_agent.py      # Extracts resume claims & skills
│   │   ├── interview_planner_agent.py # Generates question progression
│   │   ├── interviewer_agent.py # Delivers active questions
│   │   ├── evaluator_agent.py   # Rubric scoring & model answers
│   │   ├── followup_agent.py    # Adaptive follow-up decisions
│   │   └── career_coach_agent.py# Synthesizes 3-priority study roadmap
│   ├── services/
│   │   ├── ollama_service.py    # Local Ollama integration
│   │   ├── gemini_service.py    # Google GenAI integration
│   │   ├── ai_router.py         # Provider routing & fallback handling
│   │   ├── resume_parser.py     # PDF/DOCX/TXT text extraction
│   │   ├── scoring_service.py   # Scoring & metrics aggregator
│   │   ├── session_manager.py   # In-memory TTL session store
│   │   └── pdf_report_service.py# ReportLab PDF generator
│   ├── models/
│   │   ├── schemas.py           # Pydantic models for API
│   │   └── session.py           # Session state representations
│   ├── prompts/                 # Agent system prompts (.txt)
│   └── utils/
│       ├── file_validation.py   # File extension & size security
│       └── json_parser.py       # Robust LLM JSON parsing
├── tests/                       # Automated pytest test suite
├── requirements.txt             # Pip dependency list
└── pytest.ini                   # Pytest configuration
```

---

## 2. API Endpoints Reference

### Health & AI Providers
- `GET /api/health`: Returns API service health status and version.
- `GET /api/ai/providers`: Returns availability of Ollama and Gemini AI models.
- `GET /api/ai/ollama/models`: Returns list of installed local Ollama models.

### Resume & Job Matching
- `POST /api/resume/upload`: Uploads and parses text from PDF, DOCX, or TXT (Max 5MB).
- `POST /api/resume/analyze`: Extracts structured skills, projects, and evidence via AI.
- `POST /api/resume/match-job`: Cross-references resume evidence against a target Job Description.
- `DELETE /api/resume/{resume_id}`: Deletes the temporary resume file.

### Interview Lifecycle
- `POST /api/interviews`: Initializes a new interview session and prepares questions.
- `GET /api/interviews/{session_id}`: Retrieves the interview session state and progress.
- `GET /api/interviews/{session_id}/question`: Retrieves the active question.
- `POST /api/interviews/{session_id}/answer`: Submits candidate answer, runs evaluation, and decides next step.
- `POST /api/interviews/{session_id}/next`: Advances to next question in coaching mode.
- `POST /api/interviews/{session_id}/finish`: Ends the interview and triggers the Career Coach Agent.
- `GET /api/interviews/{session_id}/results`: Retrieves the final report and scores.
- `DELETE /api/interviews/{session_id}`: Purges session from memory.

### Reports
- `GET /api/interviews/{session_id}/report/pdf`: Streams the ReportLab PDF performance report.
- `GET /api/interviews/{session_id}/report/json`: Returns interview results in JSON.

---

## 3. Running Backend Tests

```powershell
.\venv\Scripts\python -m pytest -v
```
