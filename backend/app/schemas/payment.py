from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class TossPaymentMethod(str, Enum):
    CARD = "CARD"
    ACCOUNT = "ACCOUNT"
    TRANSFER = "TRANSFER"
    CELLPHONE = "CELLPHONE"
    BOOK = "BOOK"


class TossPaymentStatus(str, Enum):
    READY = "READY"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    CANCELLED = "CANCELLED"
    PARTIAL_CANCELLED = "PARTIAL_CANCELLED"
    FAILED = "FAILED"


class BarobillDocType(str, Enum):
    TAX_INVOICE = "TAX_INVOICE"
    PRICE_CALCULATION = "PRICE_CALCULATION"
    CONTRACT = "CONTRACT"
    CUSTOM_APPLICATION = "CUSTOM_APPLICATION"


class BarobillFaxStatus(str, Enum):
    PENDING = "PENDING"
    TRANSMITTING = "TRANSMITTING"
    SENT = "SENT"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class TossPaymentBase(BaseModel):
    center_id: UUID
    customer_id: Optional[UUID] = None
    sale_id: Optional[UUID] = None
    amount: int
    method: TossPaymentMethod


class TossPaymentCreate(TossPaymentBase):
    pass


class TossPaymentResponse(TossPaymentBase):
    id: UUID
    order_id: str
    payment_key: Optional[str] = None
    status: TossPaymentStatus
    approved_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    fail_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TossPaymentRequestResponse(BaseModel):
    order_id: str
    payment_url: str


class TossPaymentConfirmRequest(BaseModel):
    order_id: str
    payment_key: str
    amount: int


class TossPaymentCancelRequest(BaseModel):
    order_id: str
    cancel_reason: Optional[str] = None


class BarobillFaxBase(BaseModel):
    center_id: UUID
    customer_id: Optional[UUID] = None
    tax_invoice_id: Optional[UUID] = None
    mgt_num: str
    fax_number: str
    document_type: BarobillDocType
    file_url: str


class BarobillFaxCreate(BarobillFaxBase):
    pass


class BarobillFaxResponse(BarobillFaxBase):
    id: UUID
    status: BarobillFaxStatus
    sent_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
