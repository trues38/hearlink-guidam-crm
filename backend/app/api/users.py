from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def list_users():
    pass


@router.get("/{user_id}")
async def get_user():
    pass


@router.post("/")
async def create_user():
    pass


@router.put("/{user_id}")
async def update_user():
    pass


@router.delete("/{user_id}")
async def delete_user():
    pass
