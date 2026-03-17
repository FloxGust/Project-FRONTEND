from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import alerts, agents, incidents, intelligence, reports, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"🚀 {settings.APP_NAME} starting...")
    yield
    # Shutdown
    print("🛑 Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Agentic SOC Platform API",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,         prefix="/api/auth",         tags=["Auth"])
app.include_router(alerts.router,       prefix="/api/alerts",       tags=["Alerts"])
app.include_router(agents.router,       prefix="/api/agents",       tags=["Agents"])
app.include_router(incidents.router,    prefix="/api/incidents",    tags=["Incidents"])
app.include_router(intelligence.router, prefix="/api/intelligence", tags=["Threat Intel"])
app.include_router(reports.router,      prefix="/api/reports",      tags=["Reports"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
