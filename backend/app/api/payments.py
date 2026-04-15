from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime

from app.core.database import get_db
from app.schemas.payment import (
    TossPaymentCreate, TossPaymentResponse, TossPaymentRequestResponse,
    TossPaymentConfirmRequest, TossPaymentCancelRequest,
    BarobillFaxCreate, BarobillFaxResponse,
    TossPaymentMethod, TossPaymentStatus, BarobillFaxStatus, BarobillDocType
)

router = APIRouter()

TOSSPAY_API_URL = "https://api-sandbox.tosspayments.com"


@router.get("/")
async def list_payments(
    center_id: Optional[UUID] = Query(None),
    customer_id: Optional[UUID] = Query(None),
    status: Optional[TossPaymentStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    where = {}
    if center_id:
        where["centerId"] = str(center_id)
    if customer_id:
        where["customerId"] = str(customer_id)
    if status:
        where["status"] = status.value

    total = await prisma.tosspayment.count(where=where)
    items = await prisma.tosspayment.find_many(
        where=where,
        skip=skip,
        take=limit,
        order=[{"createdAt": "desc"}]
    )

    await prisma.disconnect()

    return {
        "items": [TossPaymentResponse(**item.model_dump()) for item in items],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{payment_id}", response_model=TossPaymentResponse)
async def get_payment(payment_id: UUID):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    payment = await prisma.tosspayment.find_unique(where={"id": str(payment_id)})
    await prisma.disconnect()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return TossPaymentResponse(**payment.model_dump())


@router.post("/", response_model=TossPaymentResponse, status_code=201)
async def create_payment(data: TossPaymentCreate):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    order_id = f"order_{uuid4()}"

    payment = await prisma.tosspayment.create(
        data={
            "centerId": str(data.center_id),
            "customerId": str(data.customer_id) if data.customer_id else None,
            "saleId": str(data.sale_id) if data.sale_id else None,
            "orderId": order_id,
            "amount": data.amount,
            "method": data.method.value,
            "status": TossPaymentStatus.READY.value,
        }
    )

    await prisma.disconnect()
    return TossPaymentResponse(**payment.model_dump())


@router.post("/toss/request", response_model=TossPaymentRequestResponse)
async def toss_payment_request(order_id: str):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    payment = await prisma.tosspayment.find_unique(where={"orderId": order_id})
    if not payment:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="Payment not found")

    await prisma.tosspayment.update(
        where={"orderId": order_id},
        data={"status": TossPaymentStatus.IN_PROGRESS.value}
    )

    payment_url = f"{TOSSPAY_API_URL}/v1/payments/{order_id}"

    await prisma.disconnect()

    return TossPaymentRequestResponse(
        order_id=order_id,
        payment_url=payment_url
    )


@router.post("/toss/confirm", response_model=TossPaymentResponse)
async def toss_payment_confirm(data: TossPaymentConfirmRequest):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    payment = await prisma.tosspayment.find_unique(where={"orderId": data.order_id})
    if not payment:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.amount != data.amount:
        await prisma.disconnect()
        raise HTTPException(status_code=400, detail="Amount mismatch")

    updated = await prisma.tosspayment.update(
        where={"orderId": data.order_id},
        data={
            "paymentKey": data.payment_key,
            "status": TossPaymentStatus.DONE.value,
            "approvedAt": datetime.utcnow(),
        }
    )

    await prisma.disconnect()
    return TossPaymentResponse(**updated.model_dump())


@router.post("/toss/cancel", response_model=TossPaymentResponse)
async def toss_payment_cancel(data: TossPaymentCancelRequest):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    payment = await prisma.tosspayment.find_unique(where={"orderId": data.order_id})
    if not payment:
        await prisma.disconnect()
        raise HTTPException(status_code=404, detail="Payment not found")

    updated = await prisma.tosspayment.update(
        where={"orderId": data.order_id},
        data={
            "status": TossPaymentStatus.CANCELLED.value,
            "cancelledAt": datetime.utcnow(),
            "failReason": data.cancel_reason or "Cancelled by user",
        }
    )

    await prisma.disconnect()
    return TossPaymentResponse(**updated.model_dump())


@router.post("/barobill/send", response_model=BarobillFaxResponse)
async def barobill_fax_send(data: BarobillFaxCreate):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    fax = await prisma.barobillfax.create(
        data={
            "centerId": str(data.center_id),
            "customerId": str(data.customer_id) if data.customer_id else None,
            "taxInvoiceId": str(data.tax_invoice_id) if data.tax_invoice_id else None,
            "mgtNum": data.mgt_num,
            "faxNumber": data.fax_number,
            "documentType": data.document_type.value,
            "fileUrl": data.file_url,
            "status": BarobillFaxStatus.TRANSMITTING.value,
            "sentAt": datetime.utcnow(),
        }
    )

    await prisma.disconnect()

    return BarobillFaxResponse(**fax.model_dump())


@router.get("/barobill/status/{fax_id}", response_model=BarobillFaxResponse)
async def barobill_fax_status(fax_id: UUID):
    from prisma import Prisma
    prisma = Prisma()
    await prisma.connect()

    fax = await prisma.barobillfax.find_unique(where={"id": str(fax_id)})
    await prisma.disconnect()

    if not fax:
        raise HTTPException(status_code=404, detail="Fax not found")

    return BarobillFaxResponse(**fax.model_dump())
