from fastapi import FastAPI

app = FastAPI(
    title="AngaMaps API",
    description="Weather and geospatial intelligence API",
    version="1.0.0",
)


@app.get("/api")
async def root():
    return {
        "name": "AngaMaps API",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "AngaMaps API",
    }