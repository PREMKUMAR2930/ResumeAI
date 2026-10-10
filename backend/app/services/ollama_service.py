import httpx
import logging
from typing import Tuple, List, Optional
from ..config import settings

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.default_model = settings.OLLAMA_MODEL
        self.timeout = settings.AI_REQUEST_TIMEOUT_SECONDS

    async def check_availability(self) -> Tuple[bool, List[str], str]:
        """
        Checks if Ollama daemon is reachable and gets available models.
        Returns: (is_available, model_names, status_message)
        """
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    return True, models, f"Ollama connected ({len(models)} models found)"
                return False, [], f"Ollama returned HTTP {resp.status_code}"
        except httpx.ConnectError:
            return False, [], "Ollama service is unreachable. Start Ollama with 'ollama serve'."
        except Exception as e:
            return False, [], f"Ollama connection error: {str(e)}"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        json_mode: bool = True
    ) -> str:
        """
        Calls Ollama generate API.
        """
        target_model = model or self.default_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
        }
        if system_prompt:
            payload["system"] = system_prompt
        if json_mode:
            payload["format"] = "json"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(f"{self.base_url}/api/generate", json=payload)
                if resp.status_code == 404:
                    raise RuntimeError(
                        f"Ollama model '{target_model}' not found. Please run 'ollama pull {target_model}'."
                    )
                if resp.status_code != 200:
                    raise RuntimeError(f"Ollama request failed with code {resp.status_code}: {resp.text}")
                    
                data = resp.json()
                return data.get("response", "")
        except httpx.ConnectError:
            raise RuntimeError(
                f"Cannot reach Ollama at {self.base_url}. Please ensure Ollama is installed and running."
            )
        except Exception as e:
            logger.error(f"Ollama generation error: {str(e)}")
            raise

ollama_service = OllamaService()
