from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def list_consultations():
    pass


@router.get("/{consultation_id}")
async def get_consultation():
    pass


@router.post("/")
async def create_consultation():
    pass


@router.put("/{consultation_id}")
async def update_consultation():
    pass


@router.delete("/{consultation_id}")
async def delete_consultation():
    pass
