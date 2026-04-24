from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def list_customers():
    pass


@router.get("/{customer_id}")
async def get_customer():
    pass


@router.post("/")
async def create_customer():
    pass


@router.put("/{customer_id}")
async def update_customer():
    pass


@router.delete("/{customer_id}")
async def delete_customer():
    pass
