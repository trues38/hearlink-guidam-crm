from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def list_schedules():
    pass


@router.get("/{schedule_id}")
async def get_schedule():
    pass


@router.post("/")
async def create_schedule():
    pass


@router.put("/{schedule_id}")
async def update_schedule():
    pass


@router.delete("/{schedule_id}")
async def delete_schedule():
    pass
