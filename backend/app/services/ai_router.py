import logging
from typing import Optional, Tuple, Dict, Any
from ..models.schemas import AIProviderEnum, ProviderStatus, ProvidersResponse
from .ollama_service import ollama_service
from .gemini_service import gemini_service
from ..utils.json_parser import extract_and_parse_json
from ..config import settings

logger = logging.getLogger(__name__)

class AIRouter:
    def __init__(self):
        self.ollama = ollama_service
        self.gemini = gemini_service

    async def get_providers_status(self) -> ProvidersResponse:
        """Returns the health and model readiness of both providers without exposing secrets."""
        o_avail, o_models, o_msg = await self.ollama.check_availability()
        g_avail, g_msg = await self.gemini.check_availability()

        return ProvidersResponse(
            ollama=ProviderStatus(
                provider="Ollama (Local)",
                available=o_avail,
                model=self.ollama.default_model,
                message=o_msg
            ),
            gemini=ProviderStatus(
                provider="Google Gemini (Cloud)",
                available=g_avail,
                model=self.gemini.default_model,
                message=g_msg
            ),
            default_provider=settings.DEFAULT_AI_PROVIDER
        )

    async def execute_structured_query(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        preferred_provider: AIProviderEnum = AIProviderEnum.HYBRID,
        task_type: str = "general", # 'resume', 'plan', 'evaluation', 'followup', 'coaching'
        max_retries: int = 2
    ) -> Tuple[Dict[str, Any], str]:
        """
        Executes a prompt, parses the structured JSON output, handles provider routing,
        fallbacks, and retries.
        Returns: (parsed_json_dict, actual_provider_name_used)
        """
        attempts = 0
        last_error = None

        # Check availability of both
        o_avail, _, _ = await self.ollama.check_availability()
        g_avail, _ = await self.gemini.check_availability()

        # Determine order of provider execution based on user config and real-time availability
        provider_queue = []
        if preferred_provider == AIProviderEnum.OLLAMA:
            if o_avail:
                provider_queue = ["ollama"]
                if g_avail:
                    provider_queue.append("gemini_fallback")
            elif g_avail:
                logger.info("Ollama requested but unavailable. Routing to Gemini.")
                provider_queue = ["gemini"]
        elif preferred_provider == AIProviderEnum.GEMINI:
            if g_avail:
                provider_queue = ["gemini"]
                if o_avail:
                    provider_queue.append("ollama_fallback")
            elif o_avail:
                logger.info("Gemini requested but unavailable. Routing to Ollama.")
                provider_queue = ["ollama"]
        else:
            # Hybrid / Default Mode
            if o_avail and g_avail:
                if task_type in ("resume", "plan"):
                    provider_queue = ["gemini", "ollama"] # Prefer cloud gemini for speed & precision
                else:
                    provider_queue = ["gemini", "ollama"]
            elif g_avail:
                provider_queue = ["gemini"]
            elif o_avail:
                provider_queue = ["ollama"]

        if not provider_queue:
            raise RuntimeError(
                "No AI providers are available. Please configure a GEMINI_API_KEY in backend/.env or start Ollama locally."
            )

        for provider in provider_queue:
            target = provider.replace("_fallback", "")
            for attempt in range(max_retries):
                try:
                    logger.info(f"Invoking {target} (task={task_type}, attempt={attempt+1})")
                    if target == "ollama":
                        raw_resp = await self.ollama.generate(
                            prompt=prompt,
                            system_prompt=system_prompt,
                            json_mode=True
                        )
                    else:
                        raw_resp = await self.gemini.generate(
                            prompt=prompt,
                            system_prompt=system_prompt,
                            json_mode=True
                        )

                    parsed = extract_and_parse_json(raw_resp)
                    if parsed is not None:
                        provider_label = f"Ollama ({self.ollama.default_model})" if target == "ollama" else f"Gemini ({self.gemini.default_model})"
                        if "_fallback" in provider:
                            provider_label += " (Fallback)"
                        return parsed, provider_label
                    else:
                        logger.warning(f"Failed to parse JSON from {target}, retrying...")
                except Exception as e:
                    logger.warning(f"Error calling {target}: {str(e)}")
                    last_error = e
                    if attempt < max_retries - 1:
                        await asyncio.sleep(1.0 * (attempt + 1))

        raise RuntimeError(
            f"AI execution failed across all configured providers. Last error: {str(last_error)}"
        )

ai_router = AIRouter()
