import os
import asyncio
import logging
from typing import Tuple, Optional
from ..config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.default_model = settings.GEMINI_MODEL
        self._client = None
        self._genai_type = None
        self._init_sdk()

    def _init_sdk(self):
        """Initializes either google-genai or google-generativeai SDK."""
        api_key = self.api_key or os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            return

        # Attempt 1: Try new official google-genai SDK
        try:
            from google import genai
            self._client = genai.Client(api_key=api_key)
            self._genai_type = "google-genai"
            logger.info("Initialized Google GenAI SDK (google-genai)")
            return
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"Failed to initialize google-genai: {e}")

        # Attempt 2: Try legacy google.generativeai
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=api_key)
            self._client = legacy_genai
            self._genai_type = "google-generativeai"
            logger.info("Initialized Google Generative AI SDK (google-generativeai)")
            return
        except ImportError:
            logger.warning("Neither google-genai nor google-generativeai is installed.")

    async def check_availability(self) -> Tuple[bool, str]:
        """Validates whether Gemini API key is configured and can be reached."""
        api_key = self.api_key or os.environ.get("GEMINI_API_KEY", "")
        if not api_key or api_key.strip() in ("", "your_gemini_api_key"):
            return False, "Gemini API key is not configured. Add GEMINI_API_KEY in .env."

        # Re-init if needed
        if not self._client:
            self._init_sdk()

        if not self._client:
            return False, "Google GenAI SDK is not initialized."

        return True, f"Gemini API ready ({self.default_model})"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        json_mode: bool = True
    ) -> str:
        """Calls Gemini API asynchronously to generate content with automated model fallback cascade."""
        primary_model = model or self.default_model
        
        # Ensure client initialized
        if not self._client:
            self._init_sdk()
            
        if not self._client:
            raise RuntimeError(
                "Gemini API is not configured. Please set a valid GEMINI_API_KEY in backend/.env"
            )

        full_prompt = prompt
        if system_prompt:
            full_prompt = f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER REQUEST:\n{prompt}"
        if json_mode:
            full_prompt += "\n\nIMPORTANT: Respond with pure, valid JSON only. Do NOT include markdown code blocks or explanations outside JSON."

        # Model candidates ordered by reliability
        candidate_models = []
        for m in [primary_model, "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3-flash-preview", "gemini-2.5-flash-lite"]:
            if m and m not in candidate_models:
                candidate_models.append(m)

        last_exc = None
        for current_model in candidate_models:
            for retry in range(2):
                try:
                    logger.info(f"Generating content with Gemini model: {current_model} (attempt {retry+1})")
                    if self._genai_type == "google-genai":
                        def _call_genai():
                            response = self._client.models.generate_content(
                                model=current_model,
                                contents=full_prompt,
                            )
                            return response.text
                        return await asyncio.to_thread(_call_genai)
                        
                    elif self._genai_type == "google-generativeai":
                        def _call_legacy():
                            m = self._client.GenerativeModel(current_model)
                            response = m.generate_content(full_prompt)
                            return response.text
                        return await asyncio.to_thread(_call_legacy)
                    else:
                        raise RuntimeError("No Gemini SDK provider initialized.")
                except Exception as e:
                    last_exc = e
                    err_msg = str(e)
                    logger.warning(f"Gemini error with {current_model} (attempt {retry+1}): {err_msg[:120]}")
                    if "503" in err_msg or "UNAVAILABLE" in err_msg or "demand" in err_msg:
                        await asyncio.sleep(1.0 * (retry + 1))
                    elif "404" in err_msg or "not found" in err_msg or "no longer available" in err_msg:
                        # Skip immediately to next model candidate
                        break
                    else:
                        await asyncio.sleep(0.5)

        logger.error(f"All Gemini models exhausted. Last error: {str(last_exc)}")
        raise last_exc or RuntimeError("All Gemini model candidates failed.")

gemini_service = GeminiService()
