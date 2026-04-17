"""FemCare API — main application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routers import intake

app = FastAPI(
    title="FemCare API",
    description="AI-assisted gynaecological health platform",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intake.router, prefix="/api/v1/intake", tags=["intake"])


@app.get("/health")
def health():
    return {"status": "ok"}
