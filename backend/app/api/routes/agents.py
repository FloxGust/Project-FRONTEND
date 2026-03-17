from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid, asyncio, random

router = APIRouter()

# --- Schemas ---
class AgentRunRequest(BaseModel):
    agent_type: str        # triage | investigate | hunt | enrich | report
    target: str            # IP, hash, alert_id, incident_id
    context: Optional[Dict[str, Any]] = {}

class AgentJob(BaseModel):
    job_id: str
    agent_type: str
    target: str
    status: str            # queued | running | completed | failed
    progress: int          # 0-100
    result: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

# In-memory job store (replace with Redis/DB in production)
JOBS: Dict[str, dict] = {}

AGENT_CATALOG = [
    {"id": "triage",      "name": "Auto-Triage Agent",       "description": "Analyzes alerts and recommends triage decisions", "status": "ready"},
    {"id": "investigate", "name": "Investigation Agent",      "description": "Performs deep investigation on incidents",         "status": "ready"},
    {"id": "hunt",        "name": "Threat Hunt Agent",        "description": "Proactively hunts for threats in environment",    "status": "ready"},
    {"id": "enrich",      "name": "IOC Enrichment Agent",     "description": "Enriches IOCs via VirusTotal, Shodan, MISP",      "status": "ready"},
    {"id": "report",      "name": "Report Generation Agent",  "description": "Generates incident reports automatically",        "status": "ready"},
]

@router.get("/catalog")
async def get_agent_catalog():
    return AGENT_CATALOG

@router.get("/jobs", response_model=List[AgentJob])
async def list_jobs():
    return [AgentJob(**j) for j in JOBS.values()]

@router.post("/run")
async def run_agent(body: AgentRunRequest):
    job_id = str(uuid.uuid4())
    job = {
        "job_id": job_id,
        "agent_type": body.agent_type,
        "target": body.target,
        "status": "queued",
        "progress": 0,
        "result": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    JOBS[job_id] = job
    return {"job_id": job_id, "message": f"Agent '{body.agent_type}' queued for target '{body.target}'"}

@router.get("/jobs/{job_id}", response_model=AgentJob)
async def get_job_status(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    job = JOBS[job_id]
    # Simulate progress
    if job["status"] == "queued":
        job["status"] = "running"
        job["progress"] = random.randint(10, 30)
    elif job["status"] == "running":
        job["progress"] = min(job["progress"] + random.randint(20, 40), 100)
        if job["progress"] >= 100:
            job["status"] = "completed"
            job["result"] = {
                "summary": f"Agent completed analysis on {job['target']}",
                "findings": ["Suspicious activity confirmed", "IOCs extracted: 3"],
                "recommendation": "Escalate to Incident Response",
                "confidence": 0.87,
            }
    job["updated_at"] = datetime.utcnow()
    return AgentJob(**job)
