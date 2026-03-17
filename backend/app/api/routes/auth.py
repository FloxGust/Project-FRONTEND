from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.core.config import settings
import jwt

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

MOCK_USERS = {
    "analyst": {"password": "soc123", "role": "analyst", "name": "SOC Analyst"},
    "admin":   {"password": "admin123", "role": "admin",   "name": "SOC Admin"},
}

@router.post("/login")
async def login(body: LoginRequest):
    user = MOCK_USERS.get(body.username)
    if not user or user["password"] != body.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    payload = {
        "sub": body.username,
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"username": body.username, "role": user["role"], "name": user["name"]}}

@router.get("/me")
async def me():
    return {"username": "analyst", "role": "analyst", "name": "SOC Analyst"}
