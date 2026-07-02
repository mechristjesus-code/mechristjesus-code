from typing import List, Optional
from pydantic import BaseModel

class GenerationRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    dna_id: Optional[str] = None
    max_tokens: Optional[int] = 1000

class GenerationResponse(BaseModel):
    content: str
    usage: dict

class ScriptRequest(BaseModel):
    topic: str
    target_duration: Optional[int] = 60 # seconds
    tone: Optional[str] = "informative"

class TitleRequest(BaseModel):
    content: str
    count: int = 5

class TitleResponse(BaseModel):
    titles: List[str]
