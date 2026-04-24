"""
Hearlink Guidam CRM - Backend
FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api import (
    auth,
    users,
    customers,
    consultations,
    schedules,
    documents,
    payments,
    worklogs,
    notifications,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(title="Hearlink Guidam CRM API", version="0.1.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(
    consultations.router, prefix="/api/consultations", tags=["consultations"]
)
app.include_router(schedules.router, prefix="/api/schedules", tags=["schedules"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(worklogs.router, prefix="/api/worklogs", tags=["worklogs"])
app.include_router(
    notifications.router, prefix="/api/notifications", tags=["notifications"]
)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "hearlink-crm-api"}
