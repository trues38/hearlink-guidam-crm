from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class WorkLogType(str, Enum):
    CUSTOMER_VISIT = "CUSTOMER_VISIT"
    PHONE_CALL = "PHONE_CALL"
    DEVICE_FITTING = "DEVICE_FITTING"
    FOLLOW_UP = "FOLLOW_UP"
    DOCUMENT_PREP = "DOCUMENT_PREP"
    MEETING = "MEETING"
    ADMIN_TASK = "ADMIN_TASK"
    OTHER = "OTHER"


class WorkLogBase(BaseModel):
    center_id: UUID
    user_id: UUID
    customer_id: Optional[UUID] = None
    type: WorkLogType
    content: str
    metadata: Optional[Any] = None


class WorkLogCreate(WorkLogBase):
    pass


class WorkLogUpdate(BaseModel):
    customer_id: Optional[UUID] = None
    type: Optional[WorkLogType] = None
    content: Optional[str] = None
    metadata: Optional[Any] = None


class WorkLogResponse(WorkLogBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class WorkLogListResponse(BaseModel):
    items: List[WorkLogResponse]
    total: int
    skip: int
    limit: int
