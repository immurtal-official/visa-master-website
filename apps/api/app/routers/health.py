"""Liveness. Public, and needs no database: it reports whether one is reachable."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.config import Settings
from app.db import Database
from app.deps import get_db, get_settings_dep

router = APIRouter(tags=["health"])


class Health(BaseModel):
    ok: bool
    db: bool
    version: str


@router.get("/health", response_model=Health)
async def health(
    db: Database = Depends(get_db), settings: Settings = Depends(get_settings_dep)
) -> Health:
    return Health(ok=True, db=await db.ping(), version=settings.version)
