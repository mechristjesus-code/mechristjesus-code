from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from packages.shared.config import get_settings
from packages.shared.utils import get_logger
from routers import auth

settings = get_settings()
logger = get_logger("auth-service")

app = FastAPI(
    title="Creator DNA OS - Auth Service",
    description="Authentication and User Management Service",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
