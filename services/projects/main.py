from fastapi import FastAPI
# router import would go here
app = FastAPI(title="Projects Service")

@app.get("/health")
async def health(): return {"status": "ok"}
