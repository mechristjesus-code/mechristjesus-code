from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from packages.shared.config import get_settings
from ..schemas.ai import GenerationRequest, GenerationResponse, ScriptRequest, TitleResponse

router = APIRouter(prefix="/ai", tags=["ai"])
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

@router.post("/generate", response_model=GenerationResponse)
async def generate_content(req: GenerationRequest):
    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a creative AI assistant for content creators."},
                {"role": "user", "content": req.prompt}
            ],
            max_tokens=req.max_tokens,
            temperature=settings.openai_temperature
        )
        return GenerationResponse(
            content=response.choices[0].message.content,
            usage=response.usage.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scripts", response_model=GenerationResponse)
async def generate_script(req: ScriptRequest):
    prompt = f"Write a {req.target_duration} second video script about {req.topic}. Tone: {req.tone}."
    return await generate_content(GenerationRequest(prompt=prompt))

@router.post("/titles", response_model=TitleResponse)
async def generate_titles(req: ScriptRequest):
    # Simplified for scaffold
    return TitleResponse(titles=["Title 1", "Title 2", "Title 3"])
