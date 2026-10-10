import re
import json
from typing import Any, Dict, Optional

def extract_and_parse_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Extracts JSON from LLM text output which may contain markdown code blocks,
    preamble, or trailing commentary.
    """
    if not text or not text.strip():
        return None
        
    text = text.strip()
    
    # 1. Try parsing directly
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
        
    # 2. Try extracting from ```json ... ``` or ``` ... ```
    pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    matches = re.findall(pattern, text, re.IGNORECASE)
    for match in matches:
        try:
            return json.loads(match.strip())
        except json.JSONDecodeError:
            continue
            
    # 3. Try finding the outer-most { ... } or [ ... ]
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        candidate = text[first_brace:last_brace+1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            # Try cleaning trailing commas
            cleaned = re.sub(r",\s*([}\]])", r"\1", candidate)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass
                
    # 4. Same for arrays [ ... ]
    first_bracket = text.find("[")
    last_bracket = text.rfind("]")
    if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
        candidate = text[first_bracket:last_bracket+1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            cleaned = re.sub(r",\s*([}\]])", r"\1", candidate)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass

    return None
