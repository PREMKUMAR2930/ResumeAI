from pathlib import Path
from typing import Dict, Any
from ..services.ai_router import ai_router
from ..models.schemas import ResumeAnalysis, SkillEvidence, ProjectEvidence, EducationEvidence, ExperienceEvidence, AIProviderEnum

PROMPT_FILE = Path(__file__).parent.parent / "prompts" / "resume_analysis.txt"

class ResumeAgent:
    def __init__(self):
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            self.template = f.read()

    async def analyze(
        self,
        resume_text: str,
        provider: AIProviderEnum = AIProviderEnum.HYBRID
    ) -> ResumeAnalysis:
        prompt = self.template.replace("{resume_text}", resume_text)
        
        parsed, provider_used = await ai_router.execute_structured_query(
            prompt=prompt,
            preferred_provider=provider,
            task_type="resume"
        )
        
        # Safe schema mapping with fallbacks
        candidate_name = parsed.get("candidate_name") or "Candidate"
        
        skills = []
        for s in parsed.get("skills", []):
            if isinstance(s, dict) and s.get("name"):
                skills.append(SkillEvidence(
                    name=s.get("name"),
                    evidence=s.get("evidence", "Mentioned in resume"),
                    confidence=float(s.get("confidence", 0.9)),
                    category=s.get("category", "General")
                ))
                
        projects = []
        for p in parsed.get("projects", []):
            if isinstance(p, dict) and p.get("name"):
                projects.append(ProjectEvidence(
                    name=p.get("name"),
                    description=p.get("description", ""),
                    technologies=p.get("technologies", []),
                    possible_topics=p.get("possible_topics", []),
                    key_contributions=p.get("key_contributions", [])
                ))

        education = []
        for ed in parsed.get("education", []):
            if isinstance(ed, dict):
                education.append(EducationEvidence(
                    degree=ed.get("degree", ""),
                    institution=ed.get("institution", ""),
                    year=str(ed.get("year", "")),
                    details=ed.get("details", "")
                ))

        experience = []
        for ex in parsed.get("experience", []):
            if isinstance(ex, dict):
                experience.append(ExperienceEvidence(
                    company=ex.get("company", ""),
                    role=ex.get("role", ""),
                    duration=str(ex.get("duration", "")),
                    highlights=ex.get("highlights", [])
                ))

        return ResumeAnalysis(
            candidate_name=candidate_name,
            education=education,
            skills=skills,
            programming_languages=parsed.get("programming_languages", []),
            frameworks=parsed.get("frameworks", []),
            databases=parsed.get("databases", []),
            tools=parsed.get("tools", []),
            projects=projects,
            experience=experience,
            certifications=parsed.get("certifications", []),
            achievements=parsed.get("achievements", []),
            missing_information=parsed.get("missing_information", []),
            recommended_topics=parsed.get("recommended_topics", []),
            raw_text_preview=resume_text[:400]
        )

resume_agent = ResumeAgent()
