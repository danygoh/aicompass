"""AI Compass - Validation Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.models import Assessment
from app.db import get_db

router = APIRouter(prefix="/api/validation", tags=["validation"])


class ValidationData(BaseModel):
    validated: bool
    corrections: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


@router.get("/{assessment_id}")
def get_validation_data(assessment_id: UUID, db: Session = Depends(get_db)):
    """Get intelligence data for validation"""
    
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if not assessment.intelligence_data:
        raise HTTPException(status_code=400, detail="No intelligence data to validate")
    
    # Build validation response
    categories = assessment.intelligence_data.get("categories", {})
    
    return {
        "company_name": assessment.company.name if assessment.company else None,
        "industry": assessment.company.industry if assessment.company else None,
        "collected_at": assessment.intelligence_data.get("collected_at"),
        "categories": [
            {
                "id": cat_id,
                "label": cat_data.get("label"),
                "answer": cat_data.get("answer"),
                "results": [
                    {"title": r.get("title"), "url": r.get("url")}
                    for r in cat_data.get("results", [])
                ]
            }
            for cat_id, cat_data in categories.items()
        ],
        "is_validated": assessment.intelligence_validated,
        "validation_data": assessment.validation_data
    }


@router.put("/{assessment_id}")
def submit_validation(assessment_id: UUID, validation: ValidationData, db: Session = Depends(get_db)):
    """Submit validation decision"""
    
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if not assessment.intelligence_data:
        raise HTTPException(status_code=400, detail="No intelligence data to validate")
    
    # Update validation status
    assessment.intelligence_validated = validation.validated
    assessment.validation_data = {
        "validated_at": validation.dict().get("validated_at"),
        "corrections": validation.corrections,
        "notes": validation.notes
    }
    
    # Move to next stage
    if validation.validated:
        assessment.stage = "validate_complete"
    else:
        assessment.stage = "validate_rejected"
    
    db.commit()
    db.refresh(assessment)
    
    return {
        "status": "validated" if validation.validated else "rejected",
        "message": "Intelligence data validated successfully" if validation.validated else "Validation rejected - please re-collect intelligence"
    }
