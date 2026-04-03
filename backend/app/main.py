from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    agents,
    alerts,
    auth,
    contexts,
    incidents,
    intelligence,
    investigations,
    predictions,
    recommendations,
    reports,
)
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"{settings.APP_NAME} starting...")
    yield
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Agentic SOC Platform API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(contexts.router, prefix="/api/contexts", tags=["Contexts"])
app.include_router(investigations.router, prefix="/api/investigations", tags=["Investigations"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(intelligence.router, prefix="/api/intelligence", tags=["Threat Intel"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


@app.get("/")
async def root():
    return {"status": "ok", "service": settings.APP_NAME}


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
