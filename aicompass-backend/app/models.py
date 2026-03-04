"""AI Compass Backend - SQLAlchemy Models"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, SmallInteger, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


class Company(Base):
    __tablename__ = "companies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    industry = Column(String(100))
    country = Column(String(100))
    cohort_name = Column(String(255))
    cohort_code = Column(String(50), unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    users = relationship("User", back_populates="company")
    assessments = relationship("Assessment", back_populates="company")


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255))
    role = Column(String(20), default="individual")  # individual, company_admin, super_admin
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="users")
    assessments = relationship("Assessment", back_populates="user")


class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    
    # Stage tracking
    stage = Column(String(20), default="profile")  # profile, intelligence, validate, assess, report
    status = Column(String(20), default="in_progress")  # in_progress, completed
    
    # Profile data (Stage 1)
    name = Column(String(255))
    email = Column(String(255))
    role = Column(String(255))
    
    # Intelligence (Stage 2)
    intelligence_data = Column(JSONB)
    intelligence_status = Column(String(20))  # collecting, completed
    
    # Validation (Stage 3)
    intelligence_validated = Column(Boolean, default=False)
    validation_data = Column(JSONB)
    
    # Scores (Stage 4)
    answers = Column(JSONB)  # {q1: 3, q2: 4, ...}
    score_d1 = Column(SmallInteger)  # AI Literacy
    score_d2 = Column(SmallInteger)  # Data Readiness
    score_d3 = Column(SmallInteger)  # Workflow Integration
    score_d4 = Column(SmallInteger)  # Governance & Risk
    score_d5 = Column(SmallInteger)  # Strategic Alignment
    score_total = Column(SmallInteger)
    tier = Column(String(20))  # Beginner, Developing, Intermediate, Advanced
    
    # Report (Stage 5)
    report = Column(JSONB)
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    user = relationship("User", back_populates="assessments")
    company = relationship("Company", back_populates="assessments")


class IntelligenceSnapshot(Base):
    __tablename__ = "intelligence_snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"))
    category = Column(String(50))  # 12 categories
    
    source_url = Column(Text)
    scraped_data = Column(JSONB)
    confidence_score = Column(SmallInteger)  # 0-100
    
    validated = Column(Boolean, default=False)
    validated_at = Column(DateTime)
    user_corrections = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)
