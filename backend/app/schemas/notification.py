from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class NotificationType(str, Enum):
    SCHEDULE_REMINDER = "SCHEDULE_REMINDER"
    PAYMENT_DUE = "PAYMENT_DUE"
    CUSTOMER_REGISTERED = "CUSTOMER_REGISTERED"
    DOCUMENT_READY = "DOCUMENT_READY"
    TASK_ASSIGNED = "TASK_ASSIGNED"
    SYSTEM = "SYSTEM"


class KakaoSendStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class NotificationBase(BaseModel):
    center_id: UUID
    user_id: UUID
    type: NotificationType
    title: str
    content: str
    link: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    id: UUID
    is_read: bool
    kakao_sent: bool
    kakao_sent_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    skip: int
    limit: int


class KakaoTalkLogResponse(BaseModel):
    id: UUID
    notification_id: Optional[UUID] = None
    center_id: UUID
    recipient_number: str
    template_code: str
    content: str
    status: KakaoSendStatus
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class KakaoSendRequest(BaseModel):
    notification_id: UUID
    recipient_number: str
    template_code: str = "test_template"


class KakaoSendResponse(BaseModel):
    success: bool
    log_id: Optional[UUID] = None
    message: str
