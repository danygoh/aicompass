"""AI Compass Backend - Pydantic Schemas"""
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime


# Company schemas
class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    country: Optional[str] = None
    cohort_name: Optional[str] = None
    cohort_code: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):
    id: UUID
    created_at: str
    
    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    company_id: Optional[UUID] = None


class UserResponse(UserBase):
    id: UUID
    role: str
    company_id: Optional[UUID] = None
    
    class Config:
        from_attributes = True


# Profile data
class ProfileData(BaseModel):
    name: str
    email: EmailStr
    role: str
    company_name: Optional[str] = None
    company_industry: Optional[str] = None
    company_country: Optional[str] = None


# Answer data
class AnswerData(BaseModel):
    question_id: int
    answer: int  # 1-4 scale


# Assessment create
class AssessmentCreate(BaseModel):
    user_id: Optional[UUID] = None
    company_id: Optional[UUID] = None


# Helper to convert assessment to dict
def assessment_to_dict(assessment) -> dict:
    return {
        "id": str(assessment.id),
        "user_id": str(assessment.user_id) if assessment.user_id else None,
        "company_id": str(assessment.company_id) if assessment.company_id else None,
        "stage": assessment.stage,
        "status": assessment.status,
        "name": assessment.name,
        "email": assessment.email,
        "role": assessment.role,
        "intelligence_validated": assessment.intelligence_validated,
        "score_d1": assessment.score_d1,
        "score_d2": assessment.score_d2,
        "score_d3": assessment.score_d3,
        "score_d4": assessment.score_d4,
        "score_d5": assessment.score_d5,
        "score_total": assessment.score_total,
        "tier": assessment.tier,
        "answers": dict(assessment.answers) if assessment.answers else {},
        "started_at": assessment.started_at.isoformat() if assessment.started_at else None,
        "completed_at": assessment.completed_at.isoformat() if assessment.completed_at else None,
    }
