from __future__ import annotations

import asyncio
from functools import lru_cache
from typing import Any

import httpx

from app.core.config import settings


class PaiacAPIError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def _normalize_prefix(prefix: str) -> str:
    cleaned = (prefix or "").strip().strip("/")
    if not cleaned:
        return ""
    return f"/{cleaned}"


def _ensure_path(path: str) -> str:
    return "/" + path.lstrip("/")


class PaiacStore:
    def __init__(self, *, base_url: str, api_prefix: str, timeout_seconds: int = 20) -> None:
        self.base_url = (base_url or "").strip().rstrip("/")
        self.api_prefix = _normalize_prefix(api_prefix)
        self.timeout_seconds = timeout_seconds

    def _prefix_candidates(self) -> list[str]:
        if self.api_prefix:
            return [self.api_prefix]
        return ["", "/api"]

    def _path_candidates(self, path: str) -> list[str]:
        normalized = _ensure_path(path)
        return [f"{prefix}{normalized}" for prefix in self._prefix_candidates()]

    @staticmethod
    def _clean_params(params: dict[str, Any] | None) -> dict[str, Any]:
        if not params:
            return {}
        return {key: value for key, value in params.items() if value is not None}

    @staticmethod
    def _parse_error_detail(response: httpx.Response) -> str:
        try:
            payload = response.json()
            if isinstance(payload, dict) and "detail" in payload:
                return str(payload["detail"])
            return str(payload)
        except ValueError:
            text = response.text.strip()
            return text or f"PAIAC server error ({response.status_code})"

    async def _request_json(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> Any:
        cleaned_params = self._clean_params(params)
        candidates = self._path_candidates(path)
        last_error: PaiacAPIError | None = None

        for index, candidate in enumerate(candidates):
            url = f"{self.base_url}{candidate}"
            try:
                async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                    response = await client.request(method=method, url=url, params=cleaned_params)
            except httpx.RequestError as exc:
                raise PaiacAPIError(502, f"Cannot reach PAIAC server ({self.base_url})") from exc

            if response.status_code == 404 and index < len(candidates) - 1:
                continue

            if response.status_code >= 400:
                status_code = response.status_code if response.status_code < 500 else 502
                last_error = PaiacAPIError(status_code, self._parse_error_detail(response))
                break

            if response.status_code == 204 or not response.text:
                return {}

            try:
                return response.json()
            except ValueError as exc:
                raise PaiacAPIError(502, "Invalid JSON response from PAIAC server") from exc

        if last_error is not None:
            raise last_error

        raise PaiacAPIError(502, "Failed to request PAIAC server")

    async def _fetch_all(
        self,
        path: str,
        *,
        base_params: dict[str, Any] | None = None,
        page_size: int = 200,
        max_rows: int = 5000,
    ) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        skip = 0

        while skip < max_rows:
            params = dict(base_params or {})
            params.update({"skip": skip, "limit": page_size})
            batch = await self._request_json("GET", path, params=params)
            if not isinstance(batch, list):
                break
            results.extend(batch)
            if len(batch) < page_size:
                break
            skip += page_size

        return results

    async def list_alerts(
        self,
        *,
        skip: int,
        limit: int,
        external_alert_id: str | None = None,
        severity: str | None = None,
        source: str | None = None,
        status: str | None = None,
    ) -> list[dict[str, Any]]:
        payload = await self._request_json(
            "GET",
            "/alerts/",
            params={
                "skip": skip,
                "limit": limit,
                "external_alert_id": external_alert_id,
                "severity": severity,
                "source": source,
                "status": status,
            },
        )
        return payload if isinstance(payload, list) else []

    async def get_alert(self, alert_id: int) -> dict[str, Any] | None:
        payload = await self._request_json("GET", f"/alerts/{alert_id}")
        return payload if isinstance(payload, dict) else None

    async def alert_stats(self) -> dict[str, int]:
        alerts = await self._fetch_all("/alerts/", page_size=200, max_rows=20000)

        def _severity_count(target: str) -> int:
            return sum(1 for row in alerts if str(row.get("severity", "")).lower() == target)

        total = len(alerts)
        open_count = sum(
            1 for row in alerts if str(row.get("status", "")).lower() in {"received", "open", "pending", "processing"}
        )
        escalated = sum(1 for row in alerts if str(row.get("status", "")).lower() in {"escalated", "processing"})

        return {
            "total": total,
            "critical": _severity_count("critical"),
            "high": _severity_count("high"),
            "medium": _severity_count("medium"),
            "low": _severity_count("low"),
            "open": open_count,
            "escalated": escalated,
        }

    async def list_predictions(
        self,
        *,
        skip: int,
        limit: int,
        alert_id: int | None = None,
        trace_id: str | None = None,
        status: str | None = None,
    ) -> list[dict[str, Any]]:
        payload = await self._request_json(
            "GET",
            "/predictions/",
            params={
                "skip": skip,
                "limit": limit,
                "alert_id": alert_id,
                "trace_id": trace_id,
                "status": status,
            },
        )
        return payload if isinstance(payload, list) else []

    async def get_prediction(self, prediction_id: int) -> dict[str, Any] | None:
        payload = await self._request_json("GET", f"/predictions/{prediction_id}")
        return payload if isinstance(payload, dict) else None

    async def list_contexts(
        self,
        *,
        skip: int,
        limit: int,
        alert_id: int | None = None,
        trace_id: str | None = None,
        status: str | None = None,
    ) -> list[dict[str, Any]]:
        payload = await self._request_json(
            "GET",
            "/contexts/",
            params={
                "skip": skip,
                "limit": limit,
                "alert_id": alert_id,
                "trace_id": trace_id,
                "status": status,
            },
        )
        return payload if isinstance(payload, list) else []

    async def get_context(self, context_id: int) -> dict[str, Any] | None:
        payload = await self._request_json("GET", f"/contexts/{context_id}")
        return payload if isinstance(payload, dict) else None

    async def list_investigations(
        self,
        *,
        skip: int,
        limit: int,
        alert_id: int | None = None,
        prediction_id: int | None = None,
        trace_id: str | None = None,
        verdict: str | None = None,
        status: str | None = None,
    ) -> list[dict[str, Any]]:
        payload = await self._request_json(
            "GET",
            "/investigations/",
            params={
                "skip": skip,
                "limit": limit,
                "alert_id": alert_id,
                "prediction_id": prediction_id,
                "trace_id": trace_id,
                "verdict": verdict,
                "status": status,
            },
        )
        return payload if isinstance(payload, list) else []

    async def get_investigation(self, investigation_id: int) -> dict[str, Any] | None:
        payload = await self._request_json("GET", f"/investigations/{investigation_id}")
        return payload if isinstance(payload, dict) else None

    async def list_recommendations(
        self,
        *,
        skip: int,
        limit: int,
        trace_id: str | None = None,
        investigation_id: int | None = None,
        recommendation_type: str | None = None,
        status: str | None = None,
    ) -> list[dict[str, Any]]:
        payload = await self._request_json(
            "GET",
            "/recommendations/",
            params={
                "skip": skip,
                "limit": limit,
                "trace_id": trace_id,
                "investigation_id": investigation_id,
                "recommendation_type": recommendation_type,
                "status": status,
            },
        )
        return payload if isinstance(payload, list) else []

    async def get_recommendation(self, recommendation_id: int) -> dict[str, Any] | None:
        payload = await self._request_json("GET", f"/recommendations/{recommendation_id}")
        return payload if isinstance(payload, dict) else None

    async def alert_bundle(self, alert_id: int) -> dict[str, Any]:
        alert = await self.get_alert(alert_id)
        if alert is None:
            return {}

        predictions_task = self.list_predictions(skip=0, limit=200, alert_id=alert_id, trace_id=None, status=None)
        contexts_task = self.list_contexts(skip=0, limit=200, alert_id=alert_id, trace_id=None, status=None)
        investigations_task = self.list_investigations(
            skip=0,
            limit=200,
            alert_id=alert_id,
            prediction_id=None,
            trace_id=None,
            verdict=None,
            status=None,
        )

        predictions, contexts, investigations = await asyncio.gather(
            predictions_task,
            contexts_task,
            investigations_task,
        )

        trace_id = alert.get("trace_id")
        recommendations: list[dict[str, Any]] = []

        if trace_id:
            recommendations.extend(
                await self.list_recommendations(
                    skip=0,
                    limit=200,
                    trace_id=str(trace_id),
                    investigation_id=None,
                    recommendation_type=None,
                    status=None,
                )
            )

        investigation_ids = [item.get("id") for item in investigations if item.get("id") is not None]
        for investigation_id in investigation_ids:
            recommendations.extend(
                await self.list_recommendations(
                    skip=0,
                    limit=200,
                    trace_id=None,
                    investigation_id=int(investigation_id),
                    recommendation_type=None,
                    status=None,
                )
            )

        deduped: dict[Any, dict[str, Any]] = {}
        for item in recommendations:
            key = item.get("id")
            deduped[key] = item

        return {
            "alert": alert,
            "predictions": predictions,
            "contexts": contexts,
            "investigations": investigations,
            "recommendations": list(deduped.values()),
        }


@lru_cache(maxsize=1)
def get_paiac_store() -> PaiacStore:
    return PaiacStore(
        base_url=settings.PAIAC_BASE_URL,
        api_prefix=settings.PAIAC_API_PREFIX,
        timeout_seconds=settings.PAIAC_TIMEOUT_SECONDS,
    )
