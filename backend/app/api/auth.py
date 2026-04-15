from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.post("/register")
async def register():
    pass


@router.post("/login")
async def login():
    pass


@router.post("/refresh")
async def refresh_token():
    pass
