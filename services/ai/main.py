from fastapi import FastAPI
from packages.shared.config import get_settings
from routers import ai

app = FastAPI(title="AI Service")
app.include_router(ai.router)

@app.get("/health")
async def health(): return {"status": "ok"}
