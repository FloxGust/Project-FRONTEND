from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class EnrichRequest(BaseModel):
    ioc_type: str          # ip | domain | hash | url
    value: str

@router.post("/enrich")
async def enrich_ioc(body: EnrichRequest):
    # Mock enrichment response
    return {
        "ioc_type": body.ioc_type,
        "value": body.value,
        "malicious": True,
        "confidence": 0.92,
        "sources": ["VirusTotal", "AbuseIPDB", "Shodan"],
        "tags": ["C2", "botnet", "Mirai"],
        "geo": {"country": "RU", "city": "Moscow"},
        "first_seen": "2024-01-15",
        "last_seen": datetime.utcnow().isoformat(),
    }

@router.get("/feeds")
async def threat_feeds():
    return [
        {"name": "Feodo Tracker", "type": "C2 IPs", "count": 1243, "updated": "2h ago"},
        {"name": "URLhaus",        "type": "Malicious URLs", "count": 8821, "updated": "30m ago"},
        {"name": "MISP Community", "type": "Events",    "count": 342,  "updated": "1h ago"},
    ]
