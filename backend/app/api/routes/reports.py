from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class ReportRequest(BaseModel):
    incident_id: str
    report_type: str       # executive | technical | forensic
    format: str = "pdf"

@router.post("/generate")
async def generate_report(body: ReportRequest):
    return {
        "report_id": "rpt-001",
        "incident_id": body.incident_id,
        "type": body.report_type,
        "status": "queued",
        "download_url": None,
        "message": "Report generation started. Check back in ~30 seconds.",
        "created_at": datetime.utcnow(),
    }

@router.get("/")
async def list_reports():
    return [
        {"id": "rpt-001", "title": "Incident IR-2024-001 Executive Summary", "type": "executive", "created_at": "2024-06-01"},
        {"id": "rpt-002", "title": "Ransomware Forensic Analysis",           "type": "forensic",   "created_at": "2024-06-03"},
    ]
