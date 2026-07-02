from fastapi import FastAPI

app = FastAPI(title="Memory Service")

@app.get("/health")
async def health(): return {"status": "ok"}
