from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter()

class Incident(BaseModel):
    id: str
    title: str
    severity: str
    status: str            # open | investigating | contained | closed
    assignee: Optional[str] = None
    alert_ids: List[str] = []
    description: Optional[str] = None
    mitre_techniques: List[str] = []
    created_at: datetime
    updated_at: datetime

class CreateIncidentRequest(BaseModel):
    title: str
    severity: str
    description: Optional[str] = None
    alert_ids: List[str] = []

INCIDENTS: dict = {}

@router.get("/", response_model=List[Incident])
async def list_incidents():
    return list(INCIDENTS.values())

@router.post("/", response_model=Incident)
async def create_incident(body: CreateIncidentRequest):
    inc = Incident(
        id=str(uuid.uuid4()),
        title=body.title,
        severity=body.severity,
        status="open",
        alert_ids=body.alert_ids,
        description=body.description,
        mitre_techniques=[],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    INCIDENTS[inc.id] = inc
    return inc

@router.get("/{incident_id}", response_model=Incident)
async def get_incident(incident_id: str):
    if incident_id not in INCIDENTS:
        raise HTTPException(status_code=404, detail="Incident not found")
    return INCIDENTS[incident_id]

@router.patch("/{incident_id}/status")
async def update_status(incident_id: str, status: str):
    if incident_id not in INCIDENTS:
        raise HTTPException(status_code=404, detail="Incident not found")
    INCIDENTS[incident_id].status = status
    INCIDENTS[incident_id].updated_at = datetime.utcnow()
    return {"message": f"Status updated to {status}"}
