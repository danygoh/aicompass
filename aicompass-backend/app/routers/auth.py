"""AI Compass - Authentication Router"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import secrets

from app.models import User, Company, Assessment
from app.config import get_settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

router = APIRouter(prefix="/api/auth", tags=["auth"])

settings = get_settings()
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Simple token generation (in production, use JWT)
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire.isoformat(), "token": secrets.token_urlsafe(32)})
    return to_encode["token"]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "individual"
    company_code: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    company_id: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password (simple - in production use passlib/bcrypt)
    password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
    
    # Handle company code
    company_id = None
    if user_data.company_code:
        company = db.query(Company).filter(Company.cohort_code == user_data.company_code).first()
        if company:
            company_id = company.id
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=password_hash,
        role=user_data.role,
        company_id=company_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create token
    token = create_access_token({"sub": user.email, "user_id": str(user.id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user_data.name,
            "role": user.role,
            "company_id": str(company_id) if company_id else None
        }
    }


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with email/password"""
    
    # Hash password
    password_hash = hashlib.sha256(form_data.password.encode()).hexdigest()
    
    # Find user
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or user.password_hash != password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create token
    token = create_access_token({"sub": user.email, "user_id": str(user.id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.email.split('@')[0],
            "role": user.role,
            "company_id": str(user.company_id) if user.company_id else None
        }
    }


@router.get("/me", response_model=UserResponse)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user info"""
    
    # Simple token validation (in production, decode JWT)
    user = db.query(User).filter(User.email == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.email.split('@')[0],
        "role": user.role,
        "company_id": str(user.company_id) if user.company_id else None
    }


@router.post("/refresh", response_model=Token)
def refresh_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Refresh access token"""
    
    user = db.query(User).filter(User.email == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    new_token = create_access_token({"sub": user.email, "user_id": str(user.id)})
    
    return {
        "access_token": new_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.email.split('@')[0],
            "role": user.role,
            "company_id": str(user.company_id) if user.company_id else None
        }
    }
