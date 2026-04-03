from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.paiac_store import PaiacAPIError, get_paiac_store

router = APIRouter()


def _parse_optional_int(value: Optional[str], field: str) -> Optional[int]:
    if value is None:
        return None
    try:
        return int(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {field}: {value}") from exc


def _parse_required_int(value: str, field: str) -> int:
    try:
        return int(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {field}: {value}") from exc


@router.get("/")
async def list_investigations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    alert_id: Optional[str] = Query(None),
    prediction_id: Optional[str] = Query(None),
    trace_id: Optional[str] = Query(None),
    verdict: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    store = get_paiac_store()
    try:
        return await store.list_investigations(
            skip=skip,
            limit=limit,
            alert_id=_parse_optional_int(alert_id, "alert_id"),
            prediction_id=_parse_optional_int(prediction_id, "prediction_id"),
            trace_id=trace_id,
            verdict=verdict,
            status=status,
        )
    except PaiacAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.get("/{investigation_id}")
async def get_investigation(investigation_id: str):
    parsed_id = _parse_required_int(investigation_id, "investigation_id")
    try:
        investigation = await get_paiac_store().get_investigation(parsed_id)
    except PaiacAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    if investigation is None:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return investigation
