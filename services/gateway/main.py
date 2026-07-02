import httpx
from fastapi import FastAPI, Request, Response, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from packages.shared.config import get_settings
from packages.shared.utils import get_logger, UnauthorizedError
from packages.shared.security import decode_token

settings = get_settings()
logger = get_logger("api-gateway")

app = FastAPI(
    title="Creator DNA OS - API Gateway",
    description="Main entry point for all services",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service mapping
SERVICES = {
    "auth": settings.auth_service_url,
    "ai": settings.ai_service_url,
    "dna": settings.dna_service_url,
    "memory": settings.memory_service_url,
    "media": settings.media_service_url,
    "projects": settings.projects_service_url,
}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-gateway"}

async def proxy_request(service_name: str, path: str, request: Request):
    if service_name not in SERVICES:
        raise HTTPException(status_code=404, detail="Service not found")
    
    url = f"{SERVICES[service_name]}/{path}"
    
    # Forward headers, but filter out host
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}
    
    async with httpx.AsyncClient() as client:
        try:
            method = request.method
            content = await request.body()
            params = request.query_params
            
            response = await client.request(
                method,
                url,
                headers=headers,
                content=content,
                params=params,
                timeout=60.0
            )
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        except httpx.RequestError as exc:
            logger.error(f"Error proxying to {service_name}: {exc}")
            raise HTTPException(status_code=502, detail=f"Service {service_name} unavailable")

@app.api_route("/{service_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(service_name: str, path: str, request: Request):
    return await proxy_request(service_name, path, request)
