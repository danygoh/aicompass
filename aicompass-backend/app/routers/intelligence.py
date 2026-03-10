"""AI Compass - Intelligence Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.models import Assessment
from app.services.intelligence import collect_intelligence, get_intelligence_summary
from app.db import get_db

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


@router.post("/collect/{assessment_id}")
def start_intelligence_collection(assessment_id: UUID, db: Session = Depends(get_db)):
    """Trigger intelligence collection for a company"""
    
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if not assessment.company:
        raise HTTPException(status_code=400, detail="No company associated with assessment")
    
    # Get company name and industry
    company_name = assessment.company.name
    industry = assessment.company.industry
    
    # Collect intelligence
    intelligence = collect_intelligence(company_name, industry)
    
    # Store in assessment
    assessment.intelligence_data = intelligence
    assessment.intelligence_status = intelligence.get("status", "completed")
    
    db.commit()
    db.refresh(assessment)
    
    return {
        "status": "completed",
        "company": company_name,
        "categories_collected": intelligence.get("successful_categories", 0),
        "total_categories": intelligence.get("total_categories", 12),
        "summary": get_intelligence_summary(intelligence)
    }


@router.get("/status/{assessment_id}")
def get_intelligence_status(assessment_id: UUID, db: Session = Depends(get_db)):
    """Get intelligence collection status"""
    
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if not assessment.intelligence_data:
        return {"status": "not_started", "message": "No intelligence collected"}
    
    return {
        "status": assessment.intelligence_status,
        "company": assessment.company.name if assessment.company else None,
        "collected_at": assessment.intelligence_data.get("collected_at") if assessment.intelligence_data else None,
        "categories_collected": assessment.intelligence_data.get("successful_categories", 0) if assessment.intelligence_data else 0
    }


@router.get("/data/{assessment_id}")
def get_intelligence_data(assessment_id: UUID, db: Session = Depends(get_db)):
    """Get full intelligence data"""
    
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if not assessment.intelligence_data:
        raise HTTPException(status_code=400, detail="No intelligence data available")
    
    return assessment.intelligence_data
