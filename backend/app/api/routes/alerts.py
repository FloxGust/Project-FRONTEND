from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid, random

router = APIRouter()

# --- Schemas ---
class Alert(BaseModel):
    id: str
    title: str
    severity: str          # critical | high | medium | low
    status: str            # open | triaged | closed | escalated
    source: str
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    mitre_tactic: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TriageRequest(BaseModel):
    decision: str          # true_positive | false_positive | escalate
    assignee: Optional[str] = None
    notes: Optional[str] = None

# --- Mock Data ---
MOCK_ALERTS = [
    Alert(id=str(uuid.uuid4()), title="Brute Force Login Detected", severity="high",
          status="open", source="SIEM", src_ip="192.168.1.105", dst_ip="10.0.0.1",
          mitre_tactic="TA0006 - Credential Access",
          created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    Alert(id=str(uuid.uuid4()), title="Lateral Movement via SMB", severity="critical",
          status="open", source="EDR", src_ip="10.0.1.22", dst_ip="10.0.1.50",
          mitre_tactic="TA0008 - Lateral Movement",
          created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    Alert(id=str(uuid.uuid4()), title="Suspicious PowerShell Execution", severity="high",
          status="triaged", source="EDR", src_ip="10.0.2.15",
          mitre_tactic="TA0002 - Execution",
          created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    Alert(id=str(uuid.uuid4()), title="DNS Tunneling Detected", severity="medium",
          status="open", source="NDR", src_ip="172.16.0.110",
          mitre_tactic="TA0011 - Command and Control",
          created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="critical",
    #       status="escalated", source="EDR", src_ip="10.0.3.42",
    #       mitre_tactic="TA0040 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="critical",
    #       status="escalated", source="SIEM", src_ip="12.22.2231",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="critical",
    #       status="escalated", source="SIEM", src_ip="12.22.431",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="critical",
    #       status="escalated", source="SIEM", src_ip="12.22.111",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="critical",
    #       status="escalated", source="SIEM", src_ip="12.22.131",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="critical",
    #       status="escalated", source="SIEM", src_ip="12.22.531",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="critical",
    #       status="escalated", source="SIEM", src_ip="12.22.1321",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="Low",
    #       status="escalated", source="SIEM", src_ip="12.22.12",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="Low",
    #       status="escalated", source="SIEM", src_ip="142.22.131",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="Low",
    #       status="escalated", source="SIEM", src_ip="12.252.131",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
    # Alert(id=str(uuid.uuid4()), title="Ransomware File Encryption Activity", severity="Low",
    #       status="escalated", source="SIEM", src_ip="112.252.131",
    #       mitre_tactic="TA0020 - Impact",
    #       created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
]

# --- Routes ---
@router.get("/", response_model=List[Alert])
async def list_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    alerts = MOCK_ALERTS
    if severity:
        alerts = [a for a in alerts if a.severity == severity]
    if status:
        alerts = [a for a in alerts if a.status == status]
    return alerts[offset : offset + limit]

@router.get("/stats")
async def alert_stats():
    return {
        "total": len(MOCK_ALERTS),
        "critical": sum(1 for a in MOCK_ALERTS if a.severity == "critical"),
        "high": sum(1 for a in MOCK_ALERTS if a.severity == "high"),
        "medium": sum(1 for a in MOCK_ALERTS if a.severity == "medium"),
        "open": sum(1 for a in MOCK_ALERTS if a.status == "open"),
        "escalated": sum(1 for a in MOCK_ALERTS if a.status == "escalated"),
    }

@router.get("/{alert_id}", response_model=Alert)
async def get_alert(alert_id: str):
    for alert in MOCK_ALERTS:
        if alert.id == alert_id:
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/{alert_id}/triage")
async def triage_alert(alert_id: str, body: TriageRequest):
    return {
        "alert_id": alert_id,
        "decision": body.decision,
        "assignee": body.assignee,
        "notes": body.notes,
        "triaged_at": datetime.utcnow(),
        "message": f"Alert triaged as {body.decision}",
    }
