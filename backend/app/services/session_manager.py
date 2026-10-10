import time
from typing import Dict, Optional, List
from datetime import datetime, timezone, timedelta
import threading
import logging

from ..models.session import InterviewSessionData, SessionState
from ..config import settings

logger = logging.getLogger(__name__)

class SessionManager:
    """
    In-memory session manager with TTL-based expiration and thread safety.
    """
    def __init__(self):
        self._sessions: Dict[str, InterviewSessionData] = {}
        self._lock = threading.Lock()
        
    def create_session(self, session_data: InterviewSessionData) -> InterviewSessionData:
        with self._lock:
            self._cleanup_expired()
            self._sessions[session_data.session_id] = session_data
            return session_data
            
    def get_session(self, session_id: str) -> Optional[InterviewSessionData]:
        with self._lock:
            self._cleanup_expired()
            session = self._sessions.get(session_id)
            if session:
                session.touch()
            return session
            
    def update_session(self, session_data: InterviewSessionData) -> InterviewSessionData:
        with self._lock:
            session_data.touch()
            self._sessions[session_data.session_id] = session_data
            return session_data
            
    def delete_session(self, session_id: str) -> bool:
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False
            
    def list_sessions(self) -> List[InterviewSessionData]:
        with self._lock:
            self._cleanup_expired()
            return list(self._sessions.values())
            
    def _cleanup_expired(self):
        ttl_minutes = settings.INTERVIEW_SESSION_TTL_MINUTES
        threshold = datetime.now(timezone.utc) - timedelta(minutes=ttl_minutes)
        expired_keys = [
            sid for sid, s in self._sessions.items()
            if s.updated_at < threshold
        ]
        for sid in expired_keys:
            logger.info(f"Expiring idle session: {sid}")
            del self._sessions[sid]

session_manager = SessionManager()
