from typing import Optional
from ..models.session import InterviewSessionData
from ..models.schemas import InterviewQuestion

class InterviewerAgent:
    """
    Manages delivery of planned questions and dynamic follow-ups.
    """
    def get_current_question(self, session: InterviewSessionData) -> Optional[InterviewQuestion]:
        if session.current_question:
            return session.current_question
            
        if session.current_question_index < len(session.question_plan):
            session.current_question = session.question_plan[session.current_question_index]
            return session.current_question
            
        return None

interviewer_agent = InterviewerAgent()
