"""AI Compass - Cohort & Invite Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID
import secrets
import string

from app.models import Company, Assessment
from app.config import get_settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

router = APIRouter(prefix="/api/cohort", tags=["cohort"])

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
    """Generate random invite code"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))


class CreateCohortRequest(BaseModel):
    company_name: str
    industry: str = ""
    country: str = ""


class JoinCohortRequest(BaseModel):
    code: str
    user_name: str
    user_email: str
    user_role: str


@router.post("/create")
def create_cohort(data: CreateCohortRequest, db: Session = Depends(get_db)):
    """Create a new cohort/company"""
    
    # Check if company exists
    company = db.query(Company).filter(Company.name == data.company_name).first()
    if not company:
        company = Company(
            name=data.company_name,
            industry=data.industry,
            country=data.country
        )
        db.add(company)
        db.commit()
        db.refresh(company)
    
    # Generate invite code
    code = generate_code()
    company.cohort_code = code
    db.commit()
    
    return {
        "company_id": str(company.id),
        "company_name": company.name,
        "invite_code": code,
        "message": "Cohort created successfully"
    }


@router.get("/info/{code}")
def get_cohort_info(code: str, db: Session = Depends(get_db)):
    """Get cohort info by invite code"""
    
    company = db.query(Company).filter(Company.cohort_code == code).first()
    if not company:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    # Get assessment stats
    assessments = db.query(Assessment).filter(Assessment.company_id == company.id).filter(Assessment.status == "completed").all()
    
    total = len(assessments)
    if total > 0:
        avg_score = sum(a.score_total for a in assessments) / total
    else:
        avg_score = 0
    
    return {
        "company_name": company.name,
        "industry": company.industry,
        "country": company.country,
        "total_assessments": total,
        "average_score": round(avg_score, 1)
    }


@router.post("/join")
def join_cohort(code: str, db: Session = Depends(get_db)):
    """Check if user can join cohort (for pre-validation)"""
    
    company = db.query(Company).filter(Company.cohort_code == code).first()
    if not company:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    return {
        "valid": True,
        "company_name": company.name
    }


@router.get("/dashboard/{company_id}")
def get_company_dashboard(company_id: UUID, db: Session = Depends(get_db)):
    """Get company-wide dashboard data"""
    
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get all completed assessments
    assessments = db.query(Assessment).filter(
        Assessment.company_id == company_id,
        Assessment.status == "completed"
    ).all()
    
    if not assessments:
        return {
            "company": company.name,
            "industry": company.industry,
            "total_assessments": 0,
            "message": "No completed assessments yet"
        }
    
    # Calculate stats
    total = len(assessments)
    scores = [a.score_total for a in assessments]
    avg_score = sum(scores) / total
    min_score = min(scores)
    max_score = max(scores)
    
    # Dimension averages
    dim_scores = {
        "AI Literacy": sum(a.score_d1 for a in assessments) / total,
        "Data Readiness": sum(a.score_d2 for a in assessments) / total,
        "Workflow Integration": sum(a.score_d3 for a in assessments) / total,
        "Governance & Risk": sum(a.score_d4 for a in assessments) / total,
        "Strategic Alignment": sum(a.score_d5 for a in assessments) / total,
    }
    
    # Tier distribution
    tiers = {}
    for a in assessments:
        tiers[a.tier] = tiers.get(a.tier, 0) + 1
    
    # Individual scores - PRIVACY: Only show if cohort >= 5 (per spec)
    # Also anonymize - don't expose individual names/emails
    MIN_COHORT_SIZE = 5
    
    if total >= MIN_COHORT_SIZE:
        individuals = [
            {
                "name": f"Team Member {i+1}",  # Anonymize
                "role": a.role,
                "score": a.score_total,
                "tier": a.tier,
                "completed_at": a.completed_at.isoformat() if a.completed_at else None
            }
            for i, a in enumerate(assessments)
        ]
    else:
        individuals = []  # Don't reveal individual results for small cohorts
    
    return {
        "company": {
            "id": str(company.id),
            "name": company.name,
            "industry": company.industry,
            "country": company.country,
            "invite_code": company.cohort_code
        },
        "summary": {
            "total_assessments": total,
            "average_score": round(avg_score, 1),
            "min_score": min_score,
            "max_score": max_score,
            "response_rate": "N/A",  # Would need total invited vs completed
            "privacy_message": None if total >= 5 else f"Individual results hidden (minimum {MIN_COHORT_SIZE} required for privacy)"
        },
        "dimensions": {k: round(v, 1) for k, v in dim_scores.items()},
        "tiers": tiers,
        "individuals": sorted(individuals, key=lambda x: x['completed_at'], reverse=True) if individuals else []
    }


@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    """Get company leaderboard by average score"""
    
    companies = db.query(Company).filter(Company.cohort_code != None).all()
    
    leaderboard = []
    for company in companies:
        assessments = db.query(Assessment).filter(
            Assessment.company_id == company.id,
            Assessment.status == "completed"
        ).all()
        
        if assessments:
            avg = sum(a.score_total for a in assessments) / len(assessments)
            leaderboard.append({
                "company": company.name,
                "industry": company.industry,
                "assessments": len(assessments),
                "average_score": round(avg, 1)
            })
    
    # Sort by average score
    leaderboard.sort(key=lambda x: x['average_score'], reverse=True)
    
    return {
        "leaderboard": leaderboard[:20]  # Top 20
    }
