from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.routers import auth, heatmap, sessions, study_days


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: engine is already created at import time
    yield
    # Shutdown: dispose engine
    await engine.dispose()


app = FastAPI(
    title="Studiary API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(study_days.router, prefix="/api/v1")
app.include_router(heatmap.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
