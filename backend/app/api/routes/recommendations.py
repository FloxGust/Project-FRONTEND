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
async def list_recommendations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    trace_id: Optional[str] = Query(None),
    investigation_id: Optional[str] = Query(None),
    recommendation_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    store = get_paiac_store()
    try:
        return await store.list_recommendations(
            skip=skip,
            limit=limit,
            trace_id=trace_id,
            investigation_id=_parse_optional_int(investigation_id, "investigation_id"),
            recommendation_type=recommendation_type,
            status=status,
        )
    except PaiacAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.get("/{recommendation_id}")
async def get_recommendation(recommendation_id: str):
    parsed_id = _parse_required_int(recommendation_id, "recommendation_id")
    try:
        recommendation = await get_paiac_store().get_recommendation(parsed_id)
    except PaiacAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    if recommendation is None:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return recommendation
