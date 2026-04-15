from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class DocumentPurpose(str, Enum):
    DEVICE = "DEVICE"
    CONFORMITY = "CONFORMITY"


class DocumentInsuranceType(str, Enum):
    GENERAL = "GENERAL"
    LOCAL_MEDICAL = "LOCAL_MEDICAL"


class DocumentType(str, Enum):
    TAX_INVOICE = "TAX_INVOICE"
    TRANSACTION_STATEMENT = "TRANSACTION_STATEMENT"
    PRESCRIPTION = "PRESCRIPTION"
    HOSPITAL_AUDIOGRAM = "HOSPITAL_AUDIOGRAM"
    DEVICE_CLAIM = "DEVICE_CLAIM"
    STANDARD_CONTRACT = "STANDARD_CONTRACT"
    CLAIM_DELEGATION = "CLAIM_DELEGATION"
    INSPECTION_CERTIFICATE = "INSPECTION_CERTIFICATE"
    INSPECTION_AUDIOGRAM = "INSPECTION_AUDIOGRAM"
    ID_COPY = "ID_COPY"
    DEVICE_BARCODE_PHOTO = "DEVICE_BARCODE_PHOTO"
    DEVICE_APPLICATION = "DEVICE_APPLICATION"
    FITTING_REPORT = "FITTING_REPORT"
    CENTER_AUDIOGRAM = "CENTER_AUDIOGRAM"
    CONFORMITY_CLAIM = "CONFORMITY_CLAIM"
    CONFORMITY_CERTIFICATE = "CONFORMITY_CERTIFICATE"


class DataSourceType(str, Enum):
    CUSTOMER_FORM = "CUSTOMER_FORM"
    AUDIOMETRY = "AUDIOMETRY"
    DEVICE = "DEVICE"
    PAYMENT = "PAYMENT"
    GOVERNMENT_API = "GOVERNMENT_API"
    MANUAL = "MANUAL"


class LinkageStatus(str, Enum):
    PENDING = "PENDING"
    LINKED = "LINKED"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"


class DocumentBase(BaseModel):
    customer_id: UUID
    purpose: DocumentPurpose
    insurance_type: DocumentInsuranceType
    type: DocumentType
    key: str


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    key: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    items: List[DocumentResponse]
    total: int
    skip: int
    limit: int


class DocumentPreviewResponse(BaseModel):
    id: UUID
    document_id: UUID
    preview_url: str
    pdf_url: Optional[str] = None
    expires_at: datetime
    created_at: datetime


class DocumentDataLinkageResponse(BaseModel):
    id: UUID
    document_id: UUID
    source_type: DataSourceType
    source_id: Optional[str] = None
    mapped_fields: Any
    status: LinkageStatus
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class LinkDataRequest(BaseModel):
    source_type: DataSourceType
    source_id: Optional[str] = None
