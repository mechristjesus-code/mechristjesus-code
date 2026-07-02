from fastapi import FastAPI
from routers import media

app = FastAPI(title="Media Service")
app.include_router(media.router)

@app.get("/health")
async def health(): return {"status": "ok"}
