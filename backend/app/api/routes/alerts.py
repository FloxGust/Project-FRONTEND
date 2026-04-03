from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services.paiac_store import PaiacAPIError, get_paiac_store

router = APIRouter()


class TriageRequest(BaseModel):
    decision: str
    assignee: Optional[str] = None
    notes: Optional[str] = None


def _to_int_id(value: str, resource: str) -> int:
    try:
        return int(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {resource} id: {value}") from exc


@router.get("/")
async def list_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    external_alert_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    store = get_paiac_store()
    try:
        return await store.list_alerts(
            skip=skip,
            limit=limit,
            external_alert_id=external_alert_id,
            severity=severity,
            source=source,
            status=status,
        )
    except PaiacAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.get("/stats")
async def alert_stats():
    try:
        return await get_paiac_store().alert_stats()
    except PaiacAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.get("/{alert_id}")
async def get_alert(alert_id: str):
    parsed_id = _to_int_id(alert_id, "alert")
    try:
        alert = await get_paiac_store().get_alert(parsed_id)
    except PaiacAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.get("/{alert_id}/details")
async def get_alert_details(alert_id: str):
    parsed_id = _to_int_id(alert_id, "alert")
    try:
        bundle = await get_paiac_store().alert_bundle(parsed_id)
    except PaiacAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    if not bundle:
        raise HTTPException(status_code=404, detail="Alert not found")
    return bundle


@router.post("/{alert_id}/triage")
async def triage_alert(alert_id: str, body: TriageRequest):
    parsed_id = _to_int_id(alert_id, "alert")
    try:
        alert = await get_paiac_store().get_alert(parsed_id)
    except PaiacAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {
        "alert_id": parsed_id,
        "decision": body.decision,
        "assignee": body.assignee,
        "notes": body.notes,
        "triaged_at": datetime.utcnow().isoformat(),
        "message": f"Alert triaged as {body.decision}",
    }
