"""AI Compass - Authentication Router"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from uuid import UUID

from app.models import User, Company
from app.config import get_settings
from app.db import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


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

    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = pwd_context.hash(user_data.password)

    company_id = None
    if user_data.company_code:
        company = db.query(Company).filter(Company.cohort_code == user_data.company_code).first()
        if company:
            company_id = company.id

    user = User(
        email=user_data.email,
        password_hash=password_hash,
        role=user_data.role,
        company_id=company_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

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

    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

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
def me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.email.split('@')[0],
        "role": current_user.role,
        "company_id": str(current_user.company_id) if current_user.company_id else None
    }


@router.post("/refresh", response_model=Token)
def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    new_token = create_access_token({"sub": current_user.email, "user_id": str(current_user.id)})

    return {
        "access_token": new_token,
        "token_type": "bearer",
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "name": current_user.email.split('@')[0],
            "role": current_user.role,
            "company_id": str(current_user.company_id) if current_user.company_id else None
        }
    }
