from fastapi import FastAPI
from packages.shared.config import get_settings
# router import would go here
app = FastAPI(title="DNA Service")

@app.get("/health")
async def health(): return {"status": "ok"}
