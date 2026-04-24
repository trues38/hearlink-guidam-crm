from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.schemas.notification import (
    NotificationCreate, NotificationUpdate, NotificationResponse,
    NotificationListResponse, KakaoSendRequest, KakaoSendResponse
)

router = APIRouter()


@router.get("/", response_model=NotificationListResponse)
async def list_notifications(
    center_id: Optional[UUID] = Query(None),
    user_id: Optional[UUID] = Query(None),
    is_read: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    where = {}
    if center_id:
        where["centerId"] = str(center_id)
    if user_id:
        where["userId"] = str(user_id)
    if is_read is not None:
        where["isRead"] = is_read

    total = await prisma.notification.count(where=where)
    items = await prisma.notification.find_many(
        where=where,
        skip=skip,
        take=limit,
        order=[{"createdAt": "desc"}]
    )

    await prisma.disconnect()

    return NotificationListResponse(
        items=[NotificationResponse(**item.model_dump()) for item in items],
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(notification_id: UUID):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    notification = await prisma.notification.find_unique(where={"id": str(notification_id)})
    await prisma.disconnect()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    return NotificationResponse(**notification.model_dump())


@router.post("/", response_model=NotificationResponse, status_code=201)
async def create_notification(data: NotificationCreate):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    notification = await prisma.notification.create(
        data={
            "centerId": str(data.center_id),
            "userId": str(data.user_id),
            "type": data.type.value,
            "title": data.title,
            "content": data.content,
            "link": data.link,
        }
    )

    await prisma.disconnect()
    return NotificationResponse(**notification.model_dump())


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: UUID):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    notification = await prisma.notification.update(
        where={"id": str(notification_id)},
        data={"isRead": True}
    )
    await prisma.disconnect()

    return {"success": True, "id": str(notification.id)}


@router.post("/send", response_model=KakaoSendResponse)
async def send_kakao_alarm(data: KakaoSendRequest):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    notification = await prisma.notification.find_unique(where={"id": str(data.notification_id)})
    if not notification:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="Notification not found")

    log = await prisma.kakaotalklog.create(
        data={
            "notificationId": str(data.notification_id),
            "centerId": notification.centerId,
            "recipientNumber": data.recipient_number,
            "templateCode": data.template_code,
            "content": notification.content,
            "status": "SENT",
            "sentAt": datetime.utcnow(),
        }
    )

    await prisma.notification.update(
        where={"id": str(data.notification_id)},
        data={"kakaoSent": True, "kakaoSentAt": datetime.utcnow()}
    )

    await prisma.disconnect()

    return KakaoSendResponse(
        success=True,
        log_id=UUID(log.id),
        message="KakaoTalk sent successfully (test mode)"
    )
