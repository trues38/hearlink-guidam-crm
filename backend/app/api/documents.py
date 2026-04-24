from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta
import subprocess
import os

from app.core.database import get_db
from app.schemas.document import (
    DocumentCreate, DocumentUpdate, DocumentResponse,
    DocumentListResponse, DocumentPreviewResponse,
    DocumentDataLinkageResponse, LinkDataRequest, DocumentPurpose,
    DocumentInsuranceType, DocumentType, DataSourceType, LinkageStatus
)

router = APIRouter()


def generate_preview_html(document, customer):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{document.type} - Preview</title>
        <style>
            body {{ font-family: 'Nanum Gothic', sans-serif; padding: 20px; }}
            h1 {{ color: #333; }}
            table {{ border-collapse: collapse; width: 100%; }}
            td, th {{ border: 1px solid #ddd; padding: 8px; }}
        </style>
    </head>
    <body>
        <h1>문서 미리보기</h1>
        <p><strong>문서 종류:</strong> {document.type}</p>
        <p><strong>목적:</strong> {document.purpose}</p>
        <p><strong>보험 유형:</strong> {document.insurance_type}</p>
        <hr>
        <h2>고객 정보</h2>
        <table>
            <tr><td>이름</td><td>{customer.name if customer else 'N/A'}</td></tr>
            <tr><td>연락처</td><td>{customer.contactNumber if customer else 'N/A'}</td></tr>
        </table>
        <hr>
        <p style="color: gray; font-size: 12px;">생성일: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </body>
    </html>
    """


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    customer_id: Optional[UUID] = Query(None),
    purpose: Optional[DocumentPurpose] = Query(None),
    insurance_type: Optional[DocumentInsuranceType] = Query(None),
    type: Optional[DocumentType] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    where = {}
    if customer_id:
        where["customerId"] = str(customer_id)
    if purpose:
        where["purpose"] = purpose.value
    if insurance_type:
        where["insuranceType"] = insurance_type.value
    if type:
        where["type"] = type.value

    total = await prisma.document.count(where=where)
    items = await prisma.document.find_many(
        where=where,
        skip=skip,
        take=limit,
        order=[{"createdAt": "desc"}]
    )

    await prisma.disconnect()

    return DocumentListResponse(
        items=[DocumentResponse(**item.model_dump()) for item in items],
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: UUID):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    document = await prisma.document.find_unique(where={"id": str(document_id)})
    await prisma.disconnect()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentResponse(**document.model_dump())


@router.post("/", response_model=DocumentResponse, status_code=201)
async def create_document(data: DocumentCreate):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    existing = await prisma.document.find_first(
        where={
            "customerId": str(data.customer_id),
            "purpose": data.purpose.value,
            "insuranceType": data.insurance_type.value,
            "type": data.type.value,
        }
    )
    if existing:
        await prisma.disconnect()
        raise HTTPException(status_code=400, detail="Document already exists for this customer")

    document = await prisma.document.create(
        data={
            "customerId": str(data.customer_id),
            "purpose": data.purpose.value,
            "insuranceType": data.insurance_type.value,
            "type": data.type.value,
            "key": data.key,
        }
    )

    await prisma.disconnect()
    return DocumentResponse(**document.model_dump())


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(document_id: UUID, data: DocumentUpdate):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    existing = await prisma.document.find_unique(where={"id": str(document_id)})
    if not existing:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = {}
    if data.key is not None:
        update_data["key"] = data.key

    document = await prisma.document.update(
        where={"id": str(document_id)},
        data=update_data
    )

    await prisma.disconnect()
    return DocumentResponse(**document.model_dump())


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: UUID):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    existing = await prisma.document.find_unique(where={"id": str(document_id)})
    if not existing:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="Document not found")

    await prisma.document.delete(where={"id": str(document_id)})
    await prisma.disconnect()


@router.post("/{document_id}/preview", response_model=DocumentPreviewResponse)
async def generate_preview(document_id: UUID):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    document = await prisma.document.find_unique(where={"id": str(document_id)})
    if not document:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="Document not found")

    customer = await prisma.customer.find_unique(where={"id": document.customerId})

    html_content = generate_preview_html(document, customer)

    preview_dir = "/tmp/hearlink_previews"
    os.makedirs(preview_dir, exist_ok=True)

    preview_filename = f"preview_{document_id}.html"
    preview_path = os.path.join(preview_dir, preview_filename)

    with open(preview_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    preview_url = f"file://{preview_path}"
    expires_at = datetime.utcnow() + timedelta(hours=24)

    preview = await prisma.documentpreview.upsert(
        where={"documentId": str(document_id)},
        data={
            "create": {
                "documentId": str(document_id),
                "previewUrl": preview_url,
                "expiresAt": expires_at,
            },
            "update": {
                "previewUrl": preview_url,
                "expiresAt": expires_at,
            }
        }
    )

    await prisma.disconnect()

    return DocumentPreviewResponse(**preview.model_dump())


@router.post("/{document_id}/link", response_model=DocumentDataLinkageResponse)
async def link_data(document_id: UUID, data: LinkDataRequest):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    document = await prisma.document.find_unique(where={"id": str(document_id)})
    if not document:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="Document not found")

    mapped_fields = {}
    if data.source_type == DataSourceType.CUSTOMER_FORM:
        customer = await prisma.customer.find_unique(where={"id": document.customerId})
        if customer:
            mapped_fields = {
                "name": customer.name,
                "contactNumber": customer.contactNumber,
                "residentNumber": customer.residentNumber,
            }

    linkage = await prisma.documentdatalinkage.create(
        data={
            "documentId": str(document_id),
            "sourceType": data.source_type.value,
            "sourceId": data.source_id,
            "mappedFields": mapped_fields,
            "status": LinkageStatus.LINKED.value,
        }
    )

    await prisma.disconnect()

    return DocumentDataLinkageResponse(**linkage.model_dump())
