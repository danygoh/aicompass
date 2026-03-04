"""AI Compass - Payments Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import secrets
import string

from app.models import Company
from app.config import get_settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

router = APIRouter(prefix="/api/payments", tags=["payments"])

settings = get_settings()
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_code(length=8):
    """Generate random bulk code"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))


# Pricing tiers (from spec)
PRICING = {
    "free": {"price": 0, "features": ["Basic assessment", "Static report"]},
    "pro": {"price": 29, "features": ["Full AI report", "History", "Email support"]},
    "team": {"price": 199, "features": ["Pro features", "Company dashboard", "Bulk codes"]}
}


class CreateCheckoutRequest(BaseModel):
    tier: str  # pro or team
    company_id: Optional[str] = None


class CreateBulkCodesRequest(BaseModel):
    company_id: str
    quantity: int = 10


@router.get("/pricing")
def get_pricing():
    """Get pricing tiers"""
    return PRICING


@router.post("/checkout")
def create_checkout_session(data: CreateCheckoutRequest):
    """Create Stripe checkout session (placeholder - needs Stripe key)"""
    
    if data.tier not in PRICING:
        raise HTTPException(status_code=400, detail="Invalid tier")
    
    tier_info = PRICING[data.tier]
    
    # In production, this would create a Stripe checkout session
    # For now, return a placeholder response
    return {
        "checkout_url": f"/checkout/{data.tier}?company={data.company_id or ''}",
        "tier": data.tier,
        "price": tier_info["price"],
        "currency": "USD",
        "message": "Stripe integration pending - configure STRIPE_API_KEY"
    }


@router.post("/webhook")
def stripe_webhook():
    """Handle Stripe webhooks (placeholder)"""
    return {"status": "received"}


@router.post("/bulk-codes")
def create_bulk_codes(data: CreateBulkCodesRequest, db: Session = Depends(get_db)):
    """Create bulk assessment codes for team purchases"""
    
    company = db.query(Company).filter(Company.id == data.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Generate codes
    codes = []
    for _ in range(data.quantity):
        code = generate_code()
        codes.append({
            "code": code,
            "tier": "team",
            "used": False
        })
    
    # Store codes (in production, store in database)
    return {
        "company": company.name,
        "codes": codes,
        "quantity": len(codes),
        "message": f"Generated {len(codes)} codes for {company.name}"
    }


@router.get("/verify-code/{code}")
def verify_code(code: str, db: Session = Depends(get_db)):
    """Verify if a bulk code is valid"""
    
    # In production, check against database
    # For now, simple placeholder
    return {
        "valid": True,
        "tier": "team",
        "message": "Code is valid"
    }
