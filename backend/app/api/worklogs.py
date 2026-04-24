from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.schemas.worklog import (
    WorkLogCreate,
    WorkLogUpdate,
    WorkLogResponse,
    WorkLogListResponse,
    WorkLogType,
)

router = APIRouter()


@router.get("/", response_model=WorkLogListResponse)
async def list_worklogs(
    center_id: Optional[UUID] = Query(None),
    user_id: Optional[UUID] = Query(None),
    customer_id: Optional[UUID] = Query(None),
    type: Optional[WorkLogType] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    from prisma import Prisma

    prisma = Prisma()
    await prisma.connect()

    where = {}
    if center_id:
        where["centerId"] = str(center_id)
    if user_id:
        where["userId"] = str(user_id)
    if customer_id:
        where["customerId"] = str(customer_id)
    if type:
        where["type"] = type.value

    total = await prisma.worklog.count(where=where)
    items = await prisma.worklog.find_many(
        where=where, skip=skip, take=limit, order=[{"createdAt": "desc"}]
    )

    await prisma.disconnect()

    return WorkLogListResponse(
        items=[WorkLogResponse(**item.model_dump()) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{worklog_id}", response_model=WorkLogResponse)
async def get_worklog(worklog_id: UUID, db: AsyncSession = Depends(get_db)):
    from prisma import Prisma

    prisma = Prisma()
    await prisma.connect()

    worklog = await prisma.worklog.find_unique(where={"id": str(worklog_id)})

    await prisma.disconnect()

    if not worklog:
        raise HTTPException(status_code=404, detail="WorkLog not found")

    return WorkLogResponse(**worklog.model_dump())


@router.post("/", response_model=WorkLogResponse, status_code=201)
async def create_worklog(data: WorkLogCreate, db: AsyncSession = Depends(get_db)):
    from prisma import Prisma

    prisma = Prisma()
    await prisma.connect()

    worklog = await prisma.worklog.create(
        data={
            "centerId": str(data.center_id),
            "userId": str(data.user_id),
            "customerId": str(data.customer_id) if data.customer_id else None,
            "type": data.type.value,
            "content": data.content,
            "metadata": data.metadata,
        }
    )

    await prisma.disconnect()

    return WorkLogResponse(**worklog.model_dump())


@router.put("/{worklog_id}", response_model=WorkLogResponse)
async def update_worklog(
    worklog_id: UUID, data: WorkLogUpdate, db: AsyncSession = Depends(get_db)
):
    from prisma import Prisma

    prisma = Prisma()
    await prisma.connect()

    existing = await prisma.worklog.find_unique(where={"id": str(worklog_id)})
    if not existing:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="WorkLog not found")

    update_data = {}
    if data.customer_id is not None:
        update_data["customerId"] = str(data.customer_id)
    if data.type is not None:
        update_data["type"] = data.type.value
    if data.content is not None:
        update_data["content"] = data.content
    if data.metadata is not None:
        update_data["metadata"] = data.metadata

    worklog = await prisma.worklog.update(
        where={"id": str(worklog_id)}, data=update_data
    )

    await prisma.disconnect()

    return WorkLogResponse(**worklog.model_dump())


@router.delete("/{worklog_id}", status_code=204)
async def delete_worklog(worklog_id: UUID, db: AsyncSession = Depends(get_db)):
    from prisma import Prisma

    prisma = Prisma()
    await prisma.connect()

    existing = await prisma.worklog.find_unique(where={"id": str(worklog_id)})
    if not existing:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="WorkLog not found")

    await prisma.worklog.delete(where={"id": str(worklog_id)})

    await prisma.disconnect()
